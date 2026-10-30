import { prisma } from './db';

export interface ComponentStockInfo {
  id: string;
  name: string;
  sku: string | null;
  slug: string;
  color: string;
  stockCount: number;
  availableStock: number;
  inStock: boolean;
  image: string;
}

export interface ComputedProductStock {
  productId: string;
  isBundle: boolean;
  stockCount: number;
  reserved: number;
  availableStock: number;
  inStock: boolean;
  isLowStock: boolean;
  components?: ComponentStockInfo[];
}

/**
 * Calculates real-time available stock for any product.
 * For bundles: Computes available units dynamically from min(component 1, component 2, component 3, component 4).
 * Ensures NO duplicate physical bundle stock is maintained.
 */
export async function computeProductStock(productId: string): Promise<ComputedProductStock | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      inventory: true,
      bundleParentItems: {
        include: {
          componentProduct: {
            include: { inventory: true },
          },
        },
      },
    },
  });

  if (!product) return null;

  if (product.isBundle) {
    const components = product.bundleParentItems.map((item) => {
      const comp = item.componentProduct;
      const stock = comp.inventory?.stockCount ?? 0;
      const reserved = comp.inventory?.reserved ?? 0;
      const available = Math.max(0, stock - reserved);
      const specs = (() => {
        try {
          return JSON.parse(comp.specifications) as Record<string, string>;
        } catch {
          return {};
        }
      })();
      const imgs = (() => {
        try {
          return JSON.parse(comp.images) as string[];
        } catch {
          return [];
        }
      })();

      return {
        id: comp.id,
        name: comp.name,
        sku: comp.sku,
        slug: comp.slug,
        color: specs['Ink Color'] || specs['Color'] || comp.subCategory || 'Standard',
        stockCount: stock,
        availableStock: available,
        inStock: available > 0,
        image: imgs[0] || '/images/brother-ink-products.jpg',
      };
    });

    // Bundle is unavailable if it has no components or if any single component has 0 available units
    const minComponentStock =
      components.length === 0
        ? 0
        : Math.min(...components.map((c) => Math.floor(c.availableStock)));

    return {
      productId: product.id,
      isBundle: true,
      stockCount: minComponentStock,
      reserved: 0,
      availableStock: minComponentStock,
      inStock: minComponentStock > 0,
      isLowStock: minComponentStock > 0 && minComponentStock <= 5,
      components,
    };
  }

  const stockCount = product.inventory?.stockCount ?? 0;
  const reserved = product.inventory?.reserved ?? 0;
  const availableStock = Math.max(0, stockCount - reserved);
  const lowAlert = product.inventory?.lowStockAlert ?? 5;

  return {
    productId: product.id,
    isBundle: false,
    stockCount,
    reserved,
    availableStock,
    inStock: availableStock > 0,
    isLowStock: availableStock > 0 && availableStock <= lowAlert,
  };
}

/**
 * Validates cart items against current database price and real-time inventory.
 * Used for server-side validation during guest/auth checkout transition.
 */
export async function validateServerCart(
  items: { productId: string; quantity: number }[]
) {
  const validatedItems = [];
  const errors: string[] = [];
  let subtotalPaise = 0;

  for (const item of items) {
    if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
      continue;
    }

    // Try finding by id or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: item.productId }, { slug: item.productId }],
      },
      include: {
        inventory: true,
        category: true,
        bundleParentItems: {
          include: {
            componentProduct: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!product) {
      errors.push(`Product with ID "${item.productId}" no longer exists in catalog.`);
      continue;
    }

    if (!product.isActive || product.status !== 'published') {
      errors.push(`"${product.name}" is currently unavailable.`);
      continue;
    }

    const stockInfo = await computeProductStock(product.id);
    const available = stockInfo?.availableStock ?? 0;

    let adjustedQuantity = item.quantity;
    if (available <= 0) {
      errors.push(`"${product.name}" is currently out of stock.`);
      adjustedQuantity = 0;
    } else if (item.quantity > available) {
      errors.push(
        `Only ${available} unit(s) of "${product.name}" are currently available in inventory.`
      );
      adjustedQuantity = available;
    }

    const itemPricePaise = product.price; // authoritative DB price
    const itemTotalPaise = itemPricePaise * adjustedQuantity;
    subtotalPaise += itemTotalPaise;

    let images: string[] = [];
    try {
      images = JSON.parse(product.images);
    } catch {
      images = ['/images/brother-ink-products.jpg'];
    }

    validatedItems.push({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      isBundle: product.isBundle,
      image: images[0] || '/images/brother-ink-products.jpg',
      price: itemPricePaise / 100, // INR
      pricePaise: itemPricePaise,
      requestedQuantity: item.quantity,
      validatedQuantity: adjustedQuantity,
      availableStock: available,
      inStock: available > 0,
      itemTotal: (itemPricePaise / 100) * adjustedQuantity,
      components: stockInfo?.components,
    });
  }

  const subtotal = subtotalPaise / 100;
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * (0.18 / 1.18));
  const grandTotal = subtotal + shipping;

  return {
    isValid: errors.length === 0,
    items: validatedItems,
    subtotal,
    shipping,
    tax,
    grandTotal,
    subtotalPaise,
    errors,
  };
}

