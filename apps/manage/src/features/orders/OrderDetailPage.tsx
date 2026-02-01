import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order, OrderStatus } from '@lunaz/types';
import { Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Status configuration with colors and descriptions
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  pending: {
    label: 'Pending',
    description: 'Awaiting confirmation',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Order has been confirmed',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  processing: {
    label: 'Processing',
    description: 'Being prepared for shipment',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  shipped: {
    label: 'Shipped',
    description: 'On the way to customer',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
  },
  delivered: {
    label: 'Delivered',
    description: 'Successfully delivered',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
  },
};

const statusTimeline: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];
const statusOptions: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// Section Card Component
function SectionCard({
  title,
  description,
  icon,
  children,
  badge,
  className = '',
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-50 flex items-start justify-between rounded-t-xl">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Sidebar Card Component
function SidebarCard({
  title,
  icon,
  children,
  highlight = false,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <div className="px-5 py-3 border-b border-gray-50/80 flex items-center gap-2 rounded-t-xl">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Professional Status Dropdown Component
function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: {
  value: OrderStatus;
  onChange: (value: OrderStatus) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedStatus = statusConfig[value];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center gap-3 p-3.5 bg-white border rounded-xl transition-all
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className={`w-3 h-3 rounded-full ${selectedStatus.color} shrink-0`} />
        <div className="flex-1 text-left">
          <span className="block text-sm font-medium text-gray-900">{selectedStatus.label}</span>
          <span className="block text-xs text-gray-500">{selectedStatus.description}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={menuStyle}
        >
          <div className="p-1.5 max-h-80 overflow-y-auto">
            {statusOptions.map((status) => {
              const config = statusConfig[status];
              const isSelected = value === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onChange(status);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                    ${isSelected ? config.bgColor : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-3 h-3 rounded-full ${config.color} shrink-0`} />
                  <div className="flex-1">
                    <span
                      className={`block text-sm font-medium ${isSelected ? config.textColor : 'text-gray-700'}`}
                    >
                      {config.label}
                    </span>
                    <span className="block text-xs text-gray-500">{config.description}</span>
                  </div>
                  {isSelected && (
                    <svg
                      className={`w-4 h-4 shrink-0 ${config.textColor}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Timeline Step Icons
const TimelineIcons: Record<OrderStatus, React.ReactNode> = {
  pending: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  confirmed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  processing: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  shipped: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    </svg>
  ),
  delivered: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
      />
    </svg>
  ),
  cancelled: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { addToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      if (!token || !id) return;
      try {
        const data = await api<Order>(`/orders/${id}`, { token });
        setOrder(data);
        setNewStatus(data.status);
        setNotes(data.notes || '');
      } catch {
        addToast('Failed to load order', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [token, id, addToast]);

  const handleUpdateStatus = async () => {
    if (!token || !id || !newStatus || newStatus === order?.status) return;

    setIsUpdating(true);
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, notes: notes || undefined }),
        token,
      });
      setOrder((prev) => (prev ? { ...prev, status: newStatus, notes } : prev));
      addToast('Order status updated successfully', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <svg className="w-6 h-6 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Order Not Found</h3>
          <p className="text-sm text-gray-500 mb-4">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusTimeline.indexOf(order.status);
  const currentStatusConfig = statusConfig[order.status];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link to="/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
            Orders
          </Link>
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-700 font-medium">#{order.orderNumber}</span>
        </nav>

        {/* Title & Status Badge */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">Order #{order.orderNumber}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${currentStatusConfig.badgeBg} ${currentStatusConfig.badgeText}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.color}`} />
                {currentStatusConfig.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Link
            to="/orders"
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          {order.status !== 'cancelled' ? (
            <SectionCard
              title="Order Progress"
              description="Track the current status of this order"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              }
            >
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full mx-8" />
                {/* Progress Bar Fill */}
                <div
                  className="absolute top-5 left-0 h-1 bg-gray-900 rounded-full mx-8 transition-all duration-500"
                  style={{
                    width: `calc(${(currentStatusIndex / (statusTimeline.length - 1)) * 100}% - 4rem)`,
                  }}
                />

                {/* Timeline Steps */}
                <div className="relative flex items-start justify-between">
                  {statusTimeline.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const config = statusConfig[status];

                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center"
                        style={{ width: '20%' }}
                      >
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'bg-white text-gray-400 border-2 border-gray-200'
                          } ${isCurrent ? 'ring-4 ring-gray-900/10' : ''}`}
                        >
                          {isCompleted && index < currentStatusIndex ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          ) : (
                            TimelineIcons[status]
                          )}
                        </div>
                        <span
                          className={`mt-3 text-xs font-medium text-center ${
                            isCurrent
                              ? 'text-gray-900'
                              : isCompleted
                                ? 'text-gray-700'
                                : 'text-gray-400'
                          }`}
                        >
                          {config.label}
                        </span>
                        {isCurrent && (
                          <span className="mt-1 text-[10px] text-gray-500 text-center">
                            {config.description}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Order Cancelled</h3>
                  <p className="mt-1 text-sm text-red-600">
                    This order has been cancelled and cannot be processed further.
                  </p>
                  {order.notes && (
                    <p className="mt-2 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                      <span className="font-medium">Reason:</span> {order.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <SectionCard
            title="Order Items"
            description={`${order.items.length} item${order.items.length !== 1 ? 's' : ''} in this order`}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            }
          >
            <div className="-mx-6 -mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-gray-100 rounded overflow-hidden shrink-0 opacity-80">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-700 truncate max-w-[180px]">
                            {item.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {item.variantName ? (
                          <span className="inline-flex px-1.5 py-0.5 text-[10px] font-normal text-gray-500 bg-gray-100 rounded">
                            {item.variantName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-xs text-gray-600">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Price
                          amount={item.unitPrice}
                          currency={order.currency}
                          className="text-xs text-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Price
                          amount={item.total}
                          currency={order.currency}
                          className="text-xs font-medium text-gray-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Shipping Address */}
          <SectionCard
            title="Shipping Address"
            description="Delivery destination for this order"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            }
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                  />
                </svg>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p className="text-gray-600">{order.shippingAddress.line2}</p>
                )}
                <p className="text-gray-600">
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
              </div>
            </div>
          </SectionCard>

          {/* Notes Section (if exists) */}
          {order.notes && order.status !== 'cancelled' && (
            <SectionCard
              title="Order Notes"
              description="Internal notes for this order"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              }
            >
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Order Summary */}
          <SidebarCard
            title="Order Summary"
            highlight={true}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            }
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <Price
                  amount={order.subtotal}
                  currency={order.currency}
                  className="text-sm text-gray-900"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shipping</span>
                {order.shippingAmount === 0 ? (
                  <span className="text-sm font-medium text-emerald-600">Free</span>
                ) : (
                  <Price
                    amount={order.shippingAmount}
                    currency={order.currency}
                    className="text-sm text-gray-900"
                  />
                )}
              </div>
              {order.taxAmount != null && order.taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax</span>
                  <Price
                    amount={order.taxAmount}
                    currency={order.currency}
                    className="text-sm text-gray-900"
                  />
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <Price
                    amount={order.total}
                    currency={order.currency}
                    className="text-lg font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </SidebarCard>

          {/* Update Status */}
          <SidebarCard
            title="Update Status"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Order Status</label>
                <StatusDropdown value={newStatus} onChange={setNewStatus} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
                  placeholder="Add internal notes about this status change..."
                />
              </div>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating || !newStatus || newStatus === order.status}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isUpdating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </SidebarCard>

          {/* Payment Information */}
          <SidebarCard
            title="Payment"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.paymentStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500'
                        : order.paymentStatus === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              {order.paymentIntentId && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Payment ID</p>
                  <p className="text-xs font-mono text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg truncate">
                    {order.paymentIntentId}
                  </p>
                </div>
              )}
            </div>
          </SidebarCard>

          {/* Customer Information */}
          <SidebarCard
            title="Customer"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(order.customerName || order.shippingAddress.name || 'C')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.customerName || order.shippingAddress.name || 'Customer'}
                </p>
                <p className="text-xs text-gray-500">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </SidebarCard>

          {/* Quick Actions */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-800">Quick Tips</p>
                <ul className="mt-1.5 text-xs text-blue-700 space-y-1">
                  <li>• Update status as order progresses</li>
                  <li>• Add notes for team communication</li>
                  <li>• Check payment status before shipping</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
