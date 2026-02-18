import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Product, Category, PaginatedResponse, ProductStatus } from 'types';
import { adminApi as api, API_URL } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';

interface VariantForm {
  id: string;
  name: string;
  sku: string;
  priceOverride: string;
  stock: string;
  isExpanded: boolean;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BDT: '৳',
};

// Section Card Component
function SectionCard({
  title,
  description,
  icon,
  children,
  actions,
  className = '',
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
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
        {actions && <div className="flex items-center gap-2">{actions}</div>}
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
          ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
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

// Form Field Component
function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Professional Dropdown Component
function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
  allowClear = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  allowClear?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder || 'Select...';

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
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left bg-white border rounded-lg transition-all
          ${
            isOpen
              ? 'border-gray-900 ring-2 ring-gray-900/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <span
          className={`flex-1 text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}
        >
          {displayLabel}
        </span>
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
          <div className="max-h-64 overflow-y-auto py-1.5">
            {allowClear && placeholder && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${!value ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <span
                  className={`flex-1 text-sm ${!value ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                >
                  {placeholder}
                </span>
                {!value && (
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${value === option.value ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-sm truncate ${value === option.value ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block text-xs text-gray-400 truncate mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
                {value === option.value && (
                  <svg
                    className="w-4 h-4 text-gray-900 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Status Dropdown Component (Special styling for publish status)
function StatusDropdown({
  value,
  onChange,
}: {
  value: ProductStatus;
  onChange: (value: ProductStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const statusOptions = [
    {
      value: 'draft' as ProductStatus,
      label: 'Draft',
      description: 'Hidden from customers',
      color: 'bg-gray-400',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      value: 'published' as ProductStatus,
      label: 'Published',
      description: 'Visible to customers',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ];

  const selectedStatus = statusOptions.find((s) => s.value === value) || statusOptions[0];

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
        className={`w-full flex items-center gap-3 p-3 bg-white border rounded-xl transition-all
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
          <div className="p-1.5">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                  ${value === option.value ? option.bgColor : 'hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${option.color} shrink-0`} />
                <div className="flex-1">
                  <span
                    className={`block text-sm font-medium ${value === option.value ? option.textColor : 'text-gray-700'}`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-xs text-gray-500">{option.description}</span>
                </div>
                {value === option.value && (
                  <svg
                    className={`w-4 h-4 shrink-0 ${option.textColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Variant Item Component
function VariantItem({
  variant,
  index,
  isOnly,
  onUpdate,
  onRemove,
  onToggle,
}: {
  variant: VariantForm;
  index: number;
  isOnly: boolean;
  onUpdate: (field: keyof VariantForm, value: string) => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/30 hover:bg-gray-50/50 transition-colors">
      {/* Variant Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-500 shadow-sm">
            {index + 1}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">
              {variant.name || `Variant ${index + 1}`}
            </span>
            {variant.sku && <span className="ml-2 text-xs text-gray-400">SKU: {variant.sku}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {variant.stock && (
            <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded">
              {variant.stock} in stock
            </span>
          )}
          {variant.priceOverride && (
            <span className="px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded">
              Override
            </span>
          )}
          <button type="button" className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${variant.isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Variant Fields (Expandable) */}
      <div
        className={`overflow-hidden transition-all duration-200 ${variant.isExpanded ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Variant Name</label>
              <input
                type="text"
                value={variant.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder="e.g., Small, Red"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU</label>
              <input
                type="text"
                value={variant.sku}
                onChange={(e) => onUpdate('sku', e.target.value)}
                placeholder="ABC-001"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Price Override
              </label>
              <input
                type="number"
                step="0.01"
                value={variant.priceOverride}
                onChange={(e) => onUpdate('priceOverride', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => onUpdate('stock', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
          {!isOnly && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove Variant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const { addToast } = useToast();

  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [variants, setVariants] = useState<VariantForm[]>([
    { id: generateId(), name: 'Default', sku: '', priceOverride: '', stock: '', isExpanded: true },
  ]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlsToAdd, setImageUrlsToAdd] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  useEffect(() => {
    if (token) {
      api<PaginatedResponse<Category>>('/categories', { token }).then((res) => {
        setCategories(res.data);
      });
    }
  }, [token]);

  // Fetch product if editing
  useEffect(() => {
    async function fetchProduct() {
      if (!isEdit || !token || !id) return;

      try {
        const product = await api<Product>(`/products/${id}`, { token });
        setName(product.name);
        setSlug(product.slug);
        setDescription(product.description || '');
        setCategoryId(product.categoryId);
        setBasePrice(product.basePrice.toString());
        setCurrency(product.currency);
        setStatus(product.status);
        setVariants(
          product.variants.map((v, i) => ({
            id: v.id,
            name: v.name,
            sku: v.sku || '',
            priceOverride: v.priceOverride?.toString() || '',
            stock: v.stock?.toString() || '',
            isExpanded: i === 0,
          }))
        );
        setExistingImages(product.images.map((img) => ({ id: img.id, url: img.url })));
      } catch {
        addToast('Failed to load product', 'error');
        navigate('/manage/products');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [isEdit, token, id, navigate, addToast]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) {
      setSlug(slugify(value));
    }
  };

  // Variants
  const addVariant = () => {
    setVariants((prev) => prev.map((v) => ({ ...v, isExpanded: false })));
    setVariants((prev) => [
      ...prev,
      { id: generateId(), name: '', sku: '', priceOverride: '', stock: '', isExpanded: true },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleVariant = (index: number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, isExpanded: !v.isExpanded } : v))
    );
  };

  // Image handling
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    try {
      new URL(imageUrl);
      setImageUrlsToAdd((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    } catch {
      addToast('Please enter a valid URL', 'error');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrlsToAdd((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!token || !id) return;

    try {
      await api(`/products/${id}/images/${imageId}`, { method: 'DELETE', token });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      addToast('Image removed', 'success');
    } catch {
      addToast('Failed to remove image', 'error');
    }
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name || !slug || !categoryId || !basePrice) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        name,
        slug,
        description: description || undefined,
        categoryId,
        basePrice: parseFloat(basePrice),
        currency,
        status,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name || 'Default',
          sku: v.sku || undefined,
          priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : undefined,
          stock: v.stock ? parseInt(v.stock, 10) : undefined,
        })),
      };

      let productId = id;

      if (isEdit) {
        await api(`/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData),
          token,
        });
      } else {
        const created = await api<Product>('/products', {
          method: 'POST',
          body: JSON.stringify(productData),
          token,
        });
        productId = created.id;
      }

      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((file) => formData.append('images', file));

        await fetch(`${API_URL}/products/${productId}/images`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      for (const url of imageUrlsToAdd) {
        await api(`/products/${productId}/images/url`, {
          method: 'POST',
          body: JSON.stringify({ url }),
          token,
        });
      }

      addToast(isEdit ? 'Product updated successfully' : 'Product created successfully', 'success');
      navigate('/manage/products');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalImages = existingImages.length + newImages.length + imageUrlsToAdd.length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-4">
            <svg className="w-6 h-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
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
          <p className="text-sm text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            to="/manage/products"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Products
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
          <span className="text-gray-700 font-medium">
            {isEdit ? 'Edit Product' : 'New Product'}
          </span>
        </nav>

        {/* Title & Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEdit ? name || 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? 'Update product information and inventory'
                : 'Add a new product to your catalog'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/manage/products"
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="product-form"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
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
                  <span>Saving...</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <SectionCard
              title="Basic Information"
              description="Product name, description, and URL slug"
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
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              }
            >
              <div className="space-y-5">
                <FormField label="Product Name" required hint="The name customers will see">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    required
                  />
                </FormField>

                <FormField
                  label="URL Slug"
                  required
                  hint="URL-friendly identifier (auto-generated from name)"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      /products/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="product-slug"
                      className="w-full pl-24 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      required
                    />
                  </div>
                </FormField>

                <FormField
                  label="Description"
                  hint="Detailed product description (supports basic formatting)"
                >
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Describe your product..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Product Images */}
            <SectionCard
              title="Product Images"
              description={`${totalImages} image${totalImages !== 1 ? 's' : ''} added`}
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              }
            >
              <div className="space-y-5">
                {/* Image Preview Grid */}
                {totalImages > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {existingImages.map((img, index) => (
                      <div key={img.id} className="relative group aspect-square">
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-full object-cover rounded-lg border border-gray-100"
                        />
                        {index === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium text-white bg-indigo-500 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, index) => (
                      <div key={`file-${index}`} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover rounded-lg border-2 border-dashed border-indigo-200"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 bg-indigo-100 rounded">
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {imageUrlsToAdd.map((url, index) => (
                      <div key={`url-${index}`} className="relative group aspect-square">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover rounded-lg border-2 border-dashed border-emerald-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%23ccc"><rect width="96" height="96"/><text x="48" y="48" text-anchor="middle" dy=".3em" font-size="10">Invalid</text></svg>';
                          }}
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded">
                          URL
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${
                      isDragging
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                        isDragging ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isDragging ? 'Drop images here' : 'Drag and drop images here'}
                    </p>
                    <p className="text-xs text-gray-500">or click to browse from your computer</p>
                    <p className="mt-2 text-[10px] text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* URL Input */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                        />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste an image URL..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="shrink-0 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Variants */}
            <SectionCard
              title="Product Variants"
              description="Manage sizes, colors, or other variations"
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
                    d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
                  />
                </svg>
              }
              actions={
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Variant
                </button>
              }
            >
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <VariantItem
                    key={variant.id}
                    variant={variant}
                    index={index}
                    isOnly={variants.length === 1}
                    onUpdate={(field, value) => updateVariant(index, field, value)}
                    onRemove={() => removeVariant(index)}
                    onToggle={() => toggleVariant(index)}
                  />
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish Status */}
            <SidebarCard
              title="Publish"
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
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              }
            >
              <div className="space-y-4">
                {/* Status Selector */}
                <StatusDropdown value={status} onChange={setStatus} />

                {/* Save Button (Mobile) */}
                <div className="lg:hidden pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isSaving ? (
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                    )}
                  </button>
                </div>
              </div>
            </SidebarCard>

            {/* Category */}
            <SidebarCard
              title="Organization"
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
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
              }
            >
              <FormField label="Category" required>
                <Dropdown
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  placeholder="Select a category"
                  allowClear
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
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  }
                />
              </FormField>
            </SidebarCard>

            {/* Pricing */}
            <SidebarCard
              title="Pricing"
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
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            >
              <div className="space-y-4">
                <FormField label="Base Price" required>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {currencySymbols[currency] || '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      required
                    />
                  </div>
                </FormField>

                <FormField label="Currency">
                  <Dropdown
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      { value: 'USD', label: 'USD ($)', description: 'United States Dollar' },
                      { value: 'EUR', label: 'EUR (€)', description: 'Euro' },
                      { value: 'GBP', label: 'GBP (£)', description: 'British Pound' },
                      { value: 'BDT', label: 'BDT (৳)', description: 'Bangladeshi Taka' },
                    ]}
                  />
                </FormField>

                {/* Price Preview */}
                {basePrice && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Preview</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {currencySymbols[currency]}
                        {parseFloat(basePrice || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SidebarCard>

            {/* Quick Tips */}
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg
                    className="w-4 h-4 text-amber-500"
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
                  <p className="text-xs font-medium text-amber-800">Quick Tips</p>
                  <ul className="mt-1.5 text-xs text-amber-700 space-y-1">
                    <li>• Use high-quality images (1000x1000px)</li>
                    <li>• Add multiple variants for options</li>
                    <li>• Set status to Draft until ready</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
