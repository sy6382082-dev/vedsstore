'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Edit,
  Upload,
  X,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  isActive: boolean;
  isBundle: boolean;
  price: number;
  originalPrice: number;
  discount: number;
  category: { id: string; name: string; slug: string };
  subCategory: string | null;
  stockCount: number;
  availableStock: number;
  reserved: number;
  lowStockAlert: number;
  badge: string | null;
  featured: boolean;
  description: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string | null;
  slug: string;
  isBundle: boolean;
  image: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: {
    paymentMethod?: string;
    paymentMethodType?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentDate?: string;
    refundStatus?: string;
    refundDate?: string;
    gateway?: string;
    mode?: string;
    paymentFailureReason?: string;
    failedAt?: string;
    landmark?: string;
    customerPhone?: string;
    customerName?: string;
    courierPartner?: string | null;
    trackingNumber?: string | null;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: AdminOrderItem[];
}

interface Props {
  adminUser: { id: string; email: string; role: string };
  initialProducts: AdminProduct[];
  categories: { id: string; name: string; slug: string }[];
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  packed: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
};

export default function AdminDashboardClient({
  adminUser,
  initialProducts,
  categories,
}: Props) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<AdminOrder | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState<string | null>(null);
  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  // Modal states for products
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogProduct, setDeleteDialogProduct] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for products
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || '');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formPrice, setFormPrice] = useState<number>(499);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(799);
  const [formStockCount, setFormStockCount] = useState<number>(20);
  const [formLowStockAlert, setFormLowStockAlert] = useState<number>(5);
  const [formStatus, setFormStatus] = useState<string>('published');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const q = new URLSearchParams();
      if (orderSearch.trim()) q.set('search', orderSearch.trim());
      if (orderStatusFilter !== 'all') q.set('status', orderStatusFilter);
      if (orderDateFilter !== 'all') q.set('date', orderDateFilter);

      const res = await fetch(`/api/admin/orders?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.metrics) setOrderMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderSearch, orderStatusFilter, orderDateFilter]);

  // Load orders when switching to orders tab or filter changes
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // Refresh products list
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to refresh products', err);
    }
  };

  // Update order status handler
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatusOrUpdates: string | { status?: string; paymentStatus?: string }
  ) => {
    setIsUpdatingOrderStatus(orderId);
    const payload =
      typeof newStatusOrUpdates === 'string'
        ? { status: newStatusOrUpdates }
        : newStatusOrUpdates;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(
          'success',
          payload.status === 'cancelled'
            ? 'Order cancelled and inventory restored successfully.'
            : payload.paymentStatus
            ? `Payment status updated to "${payload.paymentStatus}".`
            : `Order status updated to "${payload.status}".`
        );
        fetchOrders();
        refreshProducts();
        if (selectedOrderModal && selectedOrderModal.id === orderId) {
          setSelectedOrderModal((prev) =>
            prev
              ? {
                  ...prev,
                  ...(payload.status ? { status: payload.status } : {}),
                  ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
                }
              : null
          );
        }
      } else {
        showToast('error', data.error || 'Failed to update order');
      }
    } catch {
      showToast('error', 'Network error updating order status');
    } finally {
      setIsUpdatingOrderStatus(null);
    }
  };

  // Products Metrics calculation
  const totalProducts = products.length;
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const lowStockCount = products.filter(
    (p) => p.availableStock > 0 && p.availableStock <= p.lowStockAlert
  ).length;
  const outOfStockCount = products.filter((p) => p.availableStock <= 0).length;
  const bundleCount = products.filter((p) => p.isBundle).length;

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === 'published' && p.status !== 'published') return false;
      if (statusFilter === 'draft' && p.status !== 'draft') return false;
      if (statusFilter === 'archived' && p.status !== 'archived') return false;
      if (statusFilter === 'low-stock' && !(p.availableStock > 0 && p.availableStock <= p.lowStockAlert)) {
        return false;
      }
      if (categoryFilter !== 'all' && p.category.slug !== categoryFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const matchesSlug = p.slug.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesSlug;
      }

      return true;
    });
  }, [products, search, statusFilter, categoryFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditingNew(true);
    setCurrentEditId(null);
    setFormName('');
    setFormSku('');
    setFormCategoryId(categories[0]?.id || '');
    setFormSubCategory('');
    setFormPrice(499);
    setFormOriginalPrice(799);
    setFormStockCount(20);
    setFormLowStockAlert(5);
    setFormStatus('published');
    setFormBadge('');
    setFormFeatured(false);
    setFormDescription('');
    setFormFeatures('');
    setFormImageUrl('');
    setFormError('');
    setEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: AdminProduct) => {
    setIsEditingNew(false);
    setCurrentEditId(p.id);
    setFormName(p.name);
    setFormSku(p.sku || '');
    setFormCategoryId(p.category.id);
    setFormSubCategory(p.subCategory || '');
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormStockCount(p.stockCount);
    setFormLowStockAlert(p.lowStockAlert);
    setFormStatus(p.status);
    setFormBadge(p.badge || '');
    setFormFeatured(p.featured);
    setFormDescription(p.description);
    setFormFeatures(p.features.join('\n'));
    setFormImageUrl(p.images[0] || '');
    setFormError('');
    setEditModalOpen(true);
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Invalid file type. Only JPG, PNG, and WebP are allowed.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFormError('File size too large. Max 4MB allowed.');
      return;
    }

    setIsUploading(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormImageUrl(data.url);
      showToast('success', 'Image uploaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setFormError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Product title is required.');
      return;
    }

    if (formPrice <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }

    const featuresList = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const imagesList = formImageUrl.trim()
      ? [formImageUrl.trim()]
      : ['/images/brother-ink-products.jpg'];

    setIsSaving(true);

    try {
      const payload = {
        name: formName.trim(),
        sku: formSku.trim() || null,
        categoryId: formCategoryId,
        subCategory: formSubCategory.trim() || null,
        price: formPrice,
        originalPrice: formOriginalPrice || formPrice,
        stockCount: formStockCount,
        lowStockAlert: formLowStockAlert,
        status: formStatus,
        badge: formBadge.trim() || null,
        featured: formFeatured,
        description: formDescription.trim(),
        features: featuresList,
        images: imagesList,
      };

      const url = isEditingNew
        ? '/api/admin/products'
        : `/api/admin/products/${currentEditId}`;
      const method = isEditingNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      showToast(
        'success',
        isEditingNew
          ? `Product "${data.product.name}" created successfully!`
          : `Product "${data.product.name}" updated successfully!`
      );

      setEditModalOpen(false);
      refreshProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status change (publish / unpublish / archive)
  const handleQuickStatusChange = async (productId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, status: newStatus, isActive: newStatus === 'published' }
            : p
        )
      );

      showToast('success', `Product status set to "${newStatus}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      showToast('error', msg);
    }
  };

  // Confirm delete product
  const handleConfirmDelete = async () => {
    if (!deleteDialogProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteDialogProduct.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      if (data.action === 'archived') {
        showToast('success', `Product had active orders. It was safely archived.`);
      } else {
        showToast('success', `Product deleted successfully from catalog.`);
      }

      setDeleteDialogProduct(null);
      refreshProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 text-slate-900 dark:text-slate-100">
      {/* Toast popup */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Admin Role Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                <span className="text-[#0047BA] dark:text-blue-400">Brother</span> Store
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-[#0047BA] dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authorised Session: <strong className="text-slate-700 dark:text-slate-300">{adminUser.email}</strong> • Direct DB Persistence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            {activeTab === 'products' && (
              <Button
                variant="gold"
                size="sm"
                onClick={handleOpenCreate}
                className="font-bold flex items-center gap-1.5 shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#0047BA] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalogue ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#0047BA] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Management ({orderMetrics.totalOrders})</span>
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PRODUCTS CATALOGUE */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalProducts}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {publishedCount} Published Live
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Alerts</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lowStockCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Low threshold triggers
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Out of Stock</div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{outOfStockCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Requires restock
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bundle Packs</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{bundleCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Virtual dynamic inventory
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                    }}
                    title="Reset filters"
                    className="p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
                {[
                  { key: 'all', label: 'All Products' },
                  { key: 'published', label: 'Published' },
                  { key: 'draft', label: 'Drafts' },
                  { key: 'archived', label: 'Archived' },
                  { key: 'low-stock', label: '⚠️ Low Stock' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === s.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Authoritative Price</th>
                      <th className="py-3 px-4">Stock Availability</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No products found matching your current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLow = p.availableStock > 0 && p.availableStock <= p.lowStockAlert;
                        const isOut = p.availableStock <= 0;

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                  <img
                                    src={p.images[0] || '/images/brother-ink-products.jpg'}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <div className="font-bold text-slate-900 dark:text-white truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    {p.sku ? (
                                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                        SKU: {p.sku}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">No SKU</span>
                                    )}
                                    {p.isBundle && (
                                      <span className="bg-blue-100 dark:bg-blue-900/60 text-[#0047BA] dark:text-blue-300 font-bold px-1 rounded">
                                        Bundle (4-Pack)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              <div className="font-semibold">{p.category.name}</div>
                              {p.subCategory && (
                                <div className="text-[10px] text-slate-400">{p.subCategory}</div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold font-mono text-slate-900 dark:text-white">
                                {formatPrice(p.price)}
                              </div>
                              {p.originalPrice > p.price && (
                                <div className="text-[10px] text-slate-400 line-through font-mono">
                                  MRP {formatPrice(p.originalPrice)}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-bold font-mono text-xs ${
                                    isOut
                                      ? 'text-red-600 dark:text-red-400'
                                      : isLow
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {p.availableStock}
                                </span>
                                <span className="text-[10px] text-slate-400">units</span>
                              </div>
                              {p.isBundle ? (
                                <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                                  Dynamic Bundle
                                </div>
                              ) : (
                                <div className="text-[9px] text-slate-400">
                                  Reserved: {p.reserved}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  p.status === 'published'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : p.status === 'draft'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  title="View on Storefront"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>

                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  title="Edit Product"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {p.status === 'published' ? (
                                  <button
                                    onClick={() => handleQuickStatusChange(p.id, 'draft')}
                                    title="Unpublish (Set to Draft)"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Unpublish
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleQuickStatusChange(p.id, 'published')}
                                    title="Publish Live"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    Publish
                                  </button>
                                )}

                                <button
                                  onClick={() => setDeleteDialogProduct(p)}
                                  title="Delete or Archive Product"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Metric Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {orderMetrics.totalOrders}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Lifetime customer orders</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Pending Orders</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {orderMetrics.pendingOrders}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Awaiting dispatch</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Confirmed</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {orderMetrics.confirmedOrders}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Ready for packing</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Delivered</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {orderMetrics.deliveredOrders}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Completed orders</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0047BA] dark:text-blue-400">
                  Total Revenue
                </div>
                <div className="text-2xl font-black text-[#0047BA] dark:text-blue-400 font-mono mt-1">
                  {formatPrice(orderMetrics.totalRevenue)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Non-cancelled gross</div>
              </div>
            </div>

            {/* Orders Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by Order #, customer name, email, or mobile..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Date Filter */}
                  <select
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>

                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('all');
                      setOrderDateFilter('all');
                      fetchOrders();
                    }}
                    title="Refresh orders"
                    className="p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Order Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
                {[
                  { key: 'all', label: 'All Orders' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'packed', label: 'Packed' },
                  { key: 'shipped', label: 'Shipped' },
                  { key: 'delivered', label: 'Delivered' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setOrderStatusFilter(s.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                      orderStatusFilter === s.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Order Number &amp; Date</th>
                      <th className="py-3 px-4">Customer &amp; Delivery</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                          Loading orders from database…
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No orders found matching your search or filters.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-black text-slate-900 dark:text-white font-mono text-xs">
                                #{order.orderNumber}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {order.customerName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                {order.shippingAddress ? (
                                  <span>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                    {order.shippingAddress.pincode}
                                  </span>
                                ) : (
                                  <span>{order.customerEmail}</span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                📞 +91 {order.customerPhone}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              <span className="font-bold">{order.items.length}</span>{' '}
                              <span className="text-slate-400">
                                {order.items.length === 1 ? 'item' : 'items'}
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                {order.items.map((i) => i.productName).join(', ')}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold font-mono text-slate-900 dark:text-white">
                                {formatPrice(order.grandTotal)}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    PAYMENT_STATUS_COLORS[order.paymentStatus] ?? 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {order.paymentStatus}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {order.notes?.paymentMethod?.startsWith('RAZORPAY')
                                    ? order.notes.mode === 'live'
                                      ? 'Razorpay'
                                      : 'Razorpay (Test)'
                                    : 'COD'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {/* Quick status dropdown with security guard */}
                              {(() => {
                                const isUnverifiedOnline =
                                  order.notes?.paymentMethod?.startsWith('RAZORPAY') &&
                                  !order.notes?.razorpayPaymentId &&
                                  order.paymentStatus !== 'paid';

                                return (
                                  <select
                                    value={order.status}
                                    disabled={isUpdatingOrderStatus === order.id}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider border-none outline-none cursor-pointer ${
                                      ORDER_STATUS_COLORS[order.status] ?? ORDER_STATUS_COLORS.pending
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option
                                      value="confirmed"
                                      disabled={isUnverifiedOnline}
                                      title={isUnverifiedOnline ? 'Cannot confirm unverified online order' : undefined}
                                    >
                                      Confirmed {isUnverifiedOnline ? '(Locked)' : ''}
                                    </option>
                                    <option value="packed" disabled={isUnverifiedOnline}>
                                      Packed {isUnverifiedOnline ? '(Locked)' : ''}
                                    </option>
                                    <option value="shipped" disabled={isUnverifiedOnline}>
                                      Shipped {isUnverifiedOnline ? '(Locked)' : ''}
                                    </option>
                                    <option value="delivered" disabled={isUnverifiedOnline}>
                                      Delivered {isUnverifiedOnline ? '(Locked)' : ''}
                                    </option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                );
                              })()}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedOrderModal(order)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ORDER INSPECTION MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900 dark:text-white font-mono">
                    #{selectedOrderModal.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      ORDER_STATUS_COLORS[selectedOrderModal.status] ?? ORDER_STATUS_COLORS.pending
                    }`}
                  >
                    {selectedOrderModal.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrderModal.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Customer Information:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedOrderModal.customerName}
                </p>
                <p className="text-slate-500">{selectedOrderModal.customerEmail}</p>
                <p className="font-mono text-slate-500">📞 +91 {selectedOrderModal.customerPhone}</p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Shipping Destination:
                </span>
                {selectedOrderModal.shippingAddress ? (
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    <p>{selectedOrderModal.shippingAddress.addressLine1}</p>
                    {selectedOrderModal.shippingAddress.addressLine2 && (
                      <p>{selectedOrderModal.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {selectedOrderModal.shippingAddress.city},{' '}
                      {selectedOrderModal.shippingAddress.state} -{' '}
                      <strong>{selectedOrderModal.shippingAddress.pincode}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400">Standard shipping</p>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Order Items ({selectedOrderModal.items.length})
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden p-3 bg-white dark:bg-slate-900">
                {selectedOrderModal.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.sku && <span>SKU: {item.sku} • </span>}
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">
                        {formatPrice(item.itemTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-slate-500 max-w-xs ml-auto border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPrice(selectedOrderModal.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-mono">
                  {selectedOrderModal.shipping === 0 ? 'FREE' : formatPrice(selectedOrderModal.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% Included):</span>
                <span className="font-mono">{formatPrice(selectedOrderModal.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-[#0047BA] dark:text-blue-400">
                  {formatPrice(selectedOrderModal.grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Gateway & Verification Card */}
            {(() => {
              const notes = selectedOrderModal.notes || {};
              const isOnline =
                notes.paymentMethod?.startsWith('RAZORPAY') ||
                notes.gateway === 'razorpay' ||
                Boolean(notes.razorpayOrderId);
              const isVerified = Boolean(notes.razorpayPaymentId);
              const isCod = !isOnline;

              return (
                <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0047BA] dark:text-blue-400" />
                      Payment & Gateway Verification
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        PAYMENT_STATUS_COLORS[selectedOrderModal.paymentStatus] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Payment: {selectedOrderModal.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div>
                      <span className="text-[11px] text-slate-400">Payment Gateway / Method</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5">
                            Razorpay {notes.paymentMethodType ? `(${notes.paymentMethodType.toUpperCase()})` : 'Online'}
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              {notes.mode === 'live' ? 'Live' : 'Test Mode'}
                            </span>
                          </span>
                        ) : (
                          'Cash on Delivery (COD)'
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Gateway Transaction ID (Payment ID)</span>
                      <p className="font-mono text-xs mt-0.5">
                        {notes.razorpayPaymentId ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {notes.razorpayPaymentId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            {isOnline ? 'Unverified / Not captured' : 'N/A (Cash on Delivery)'}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Razorpay Order ID</span>
                      <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        {notes.razorpayOrderId || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Payment Verified At</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        {notes.paymentDate
                          ? new Date(notes.paymentDate).toLocaleString('en-IN')
                          : isOnline
                          ? 'Awaiting gateway capture'
                          : 'Due upon delivery'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Refund Status</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize mt-0.5">
                        {notes.refundStatus || 'None'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Authorized Order Amount</span>
                      <p className="text-xs font-bold font-mono text-[#0047BA] dark:text-blue-400 mt-0.5">
                        {formatPrice(selectedOrderModal.grandTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Security tamper protection notice */}
                  {isOnline && !isVerified && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        <strong>Security Guard:</strong> Manual payment override to &quot;Paid&quot; is strictly disabled for Razorpay transactions. Verification requires authentic HMAC-SHA256 signature confirmation from the gateway or webhook.
                      </span>
                    </div>
                  )}

                  {/* COD Payment Toggle for Admins */}
                  {isCod && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Update Cash on Delivery Collection:
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedOrderModal.paymentStatus}
                          disabled={isUpdatingOrderStatus === selectedOrderModal.id}
                          onChange={(e) =>
                            handleUpdateOrderStatus(selectedOrderModal.id, {
                              paymentStatus: e.target.value,
                            })
                          }
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                        >
                          <option value="pending">Pending Collection</option>
                          <option value="paid">Cash Collected (Paid)</option>
                          <option value="failed">Collection Failed</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Status Change Control in Modal */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {(() => {
                const notes = selectedOrderModal.notes || {};
                const isUnverifiedOnline =
                  (notes.paymentMethod?.startsWith('RAZORPAY') || notes.gateway === 'razorpay') &&
                  !notes.razorpayPaymentId &&
                  selectedOrderModal.paymentStatus !== 'paid';

                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Change Status:
                    </span>
                    <select
                      value={selectedOrderModal.status}
                      disabled={isUpdatingOrderStatus === selectedOrderModal.id}
                      onChange={(e) =>
                        handleUpdateOrderStatus(selectedOrderModal.id, e.target.value)
                      }
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option
                        value="confirmed"
                        disabled={isUnverifiedOnline}
                        title={isUnverifiedOnline ? 'Cannot confirm unpaid online order' : undefined}
                      >
                        Confirmed {isUnverifiedOnline ? '(Requires Payment)' : ''}
                      </option>
                      <option value="packed" disabled={isUnverifiedOnline}>
                        Packed {isUnverifiedOnline ? '(Requires Payment)' : ''}
                      </option>
                      <option value="shipped" disabled={isUnverifiedOnline}>
                        Shipped {isUnverifiedOnline ? '(Requires Payment)' : ''}
                      </option>
                      <option value="delivered" disabled={isUnverifiedOnline}>
                        Delivered {isUnverifiedOnline ? '(Requires Payment)' : ''}
                      </option>
                      <option value="cancelled">Cancelled (Restores Stock)</option>
                    </select>
                  </div>
                );
              })()}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderModal(null)}
                className="text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEditingNew ? 'Create New Catalog Product' : 'Edit Product Details'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct database persistence • Reflects immediately on storefront
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Brother BT5000C Cyan Ink Bottle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. BRO-BT5000C"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    MRP / Original (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inventory Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStockCount}
                    onChange={(e) => setFormStockCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Catalog Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="published">Published (Live Storefront)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Trending, Sale, Best Seller"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... or /images/brother-ink-products.jpg"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono text-[11px]"
                  />
                  <label className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer font-semibold flex items-center gap-1.5 shrink-0">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed product overview..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={isSaving}
                  className="font-bold flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditingNew ? 'Create Product' : 'Save Changes'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* CONFIRM DELETE DIALOG */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {deleteDialogProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm Product Deletion
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong>{deleteDialogProduct.name}</strong>?
              {deleteDialogProduct.sku && (
                <span className="block mt-1 font-mono text-slate-400">
                  SKU: {deleteDialogProduct.sku}
                </span>
              )}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 text-left">
              ⚠️ If this item has existing customer orders, it will be safely marked as <strong>Archived</strong> to preserve invoice and transaction histories.
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setDeleteDialogProduct(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={isDeleting}
                className="flex-1 text-xs font-bold flex items-center justify-center gap-1.5 bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
