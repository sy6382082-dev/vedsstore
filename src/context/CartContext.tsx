'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Product, CartItem } from '@/types';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, GST_RATE } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isHydrated: boolean;
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brother_cart';

// Safe product identifier matching that NEVER treats undefined as equal
function isSameProduct(a: Product, b: Product): boolean {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.sku && b.sku && a.sku === b.sku) return true;
  if (a.slug && b.slug && a.slug === b.slug) return true;
  if (a.slug && b.id && a.slug === b.id) return true;
  if (a.id && b.slug && a.id === b.slug) return true;
  return false;
}

function matchesProductIdentifier(product: Product, idOrSlug: string): boolean {
  if (!idOrSlug) return false;
  if (product.id && product.id === idOrSlug) return true;
  if (product.slug && product.slug === idOrSlug) return true;
  if (product.sku && product.sku === idOrSlug) return true;
  return false;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const prevUserIdRef = useRef<string | null>(null);
  const itemsRef = useRef<CartItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Synchronize cart from localStorage only AFTER component mounts on the client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize items on load so each item has a defined slug
          const normalized = parsed.map((item: CartItem) => ({
            ...item,
            product: {
              ...item.product,
              slug: item.product.slug || item.product.id,
            },
          }));
          setItems(normalized);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage only after hydration is complete and whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items, isHydrated]);

  // When user logs in, merge guest cart with server cart without duplicating items
  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && user?.id) {
      if (prevUserIdRef.current !== user.id) {
        prevUserIdRef.current = user.id;

        // Perform merge
        const localPayload = itemsRef.current.map((i) => ({
          productId: i.product.id || i.product.slug,
          quantity: i.quantity,
        }));

        fetch('/api/account/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'merge', items: localPayload }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.items && Array.isArray(data.items)) {
              setItems(data.items);
            }
          })
          .catch((err) => console.warn('Cart merge failed', err));
      }
    } else {
      prevUserIdRef.current = null;
    }
  }, [isAuthenticated, user?.id, isHydrated]);

  // Sync changes to server if logged in
  const syncToServer = useCallback(
    async (updatedItems: CartItem[]) => {
      if (!isAuthenticated) return;
      try {
        const payload = updatedItems.map((i) => ({
          productId: i.product.id || i.product.slug,
          quantity: i.quantity,
        }));
        await fetch('/api/account/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', items: payload }),
        });
      } catch (err) {
        console.warn('Failed to sync cart to server', err);
      }
    },
    [isAuthenticated]
  );

  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/account/cart');
      if (res.ok) {
        const data = await res.json();
        if (data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch server cart', err);
    }
  }, [isAuthenticated]);

  const addToCart = (product: Product, quantity = 1) => {
    const normalizedProduct: Product = {
      ...product,
      slug: product.slug || product.id,
    };

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) =>
        isSameProduct(item.product, normalizedProduct)
      );

      let updated: CartItem[];
      const maxStock = normalizedProduct.stockCount ?? 10;

      if (existingIndex > -1) {
        // Increment quantity of existing item immutably
        updated = prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: Math.min(newQty, maxStock),
            };
          }
          return item;
        });
      } else {
        // Append brand new distinct item immutably
        updated = [
          ...prevItems,
          {
            product: normalizedProduct,
            quantity: Math.min(quantity, maxStock),
          },
        ];
      }

      syncToServer(updated);
      return updated;
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const updated = prevItems.filter(
        (item) => !matchesProductIdentifier(item.product, productId)
      );
      syncToServer(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (matchesProductIdentifier(item.product, productId)) {
          const maxStock = item.product.stockCount ?? 10;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      });
      syncToServer(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated) {
      fetch('/api/account/cart', { method: 'DELETE' }).catch(() => {});
    }
  };

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [items]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal, items.length]);

  const tax = useMemo(() => {
    return Math.round(subtotal * (GST_RATE / (1 + GST_RATE)));
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + shipping;
  }, [subtotal, shipping]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping,
        tax,
        grandTotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isHydrated,
        syncWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
