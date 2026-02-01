import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Category, PaginatedResponse } from '@lunaz/types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Section Card Component
function SectionCard({
  title,
  description,
  icon,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-50 flex items-start gap-3 rounded-t-xl">
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
      <div className="p-6">{children}</div>
    </div>
  );
}

// Sidebar Card Component
function SidebarCard({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-50/80 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
        {action}
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

// Extended category type with counts
interface CategoryWithCounts extends Category {
  productCount?: number;
  childCount?: number;
}

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();

  const isEdit = Boolean(id);

  const [allCategories, setAllCategories] = useState<CategoryWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [order, setOrder] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all categories with counts
  useEffect(() => {
    if (token) {
      api<PaginatedResponse<CategoryWithCounts>>('/categories?withCounts=true', { token }).then(
        (res) => {
          setAllCategories(res.data);
        }
      );
    }
  }, [token]);

  // Fetch category if editing
  useEffect(() => {
    async function fetchCategory() {
      if (!isEdit || !token || !id) return;

      try {
        const category = await api<Category>(`/categories/${id}`, { token });
        setName(category.name);
        setSlug(category.slug);
        setParentId(category.parentId || '');
        setImageUrl(category.imageUrl || '');
        setImageUrlInput(category.imageUrl || '');
        setOrder(category.order?.toString() || '');
      } catch {
        addToast('Failed to load category', 'error');
        navigate('/categories');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategory();
  }, [isEdit, token, id, navigate, addToast]);

  // Get parent categories for dropdown (exclude self and any children)
  const parentCategoryOptions = allCategories.filter((c) => c.id !== id && !c.parentId);

  // Get child categories of current category
  const childCategories = isEdit ? allCategories.filter((c) => c.parentId === id) : [];

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) {
      setSlug(slugify(value));
    }
  };

  // Image handling
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      setImageUrlInput('');
    }
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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageUrl('');
      setImageUrlInput('');
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput);
      setImageUrl(imageUrlInput.trim());
      setImageFile(null);
    } catch {
      addToast('Please enter a valid URL', 'error');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImageUrlInput('');
  };

  const currentImageUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name || !slug) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const categoryData = {
        name,
        slug,
        parentId: parentId || undefined,
        imageUrl: imageUrl || undefined,
        order: order ? parseInt(order, 10) : undefined,
      };

      if (isEdit) {
        await api(`/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(categoryData),
          token,
        });
        addToast('Category updated successfully', 'success');
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
          token,
        });
        addToast('Category created successfully', 'success');
      }

      navigate('/categories');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Get parent category info
  const parentCategory = parentId ? allCategories.find((c) => c.id === parentId) : null;
  const isSubcategory = Boolean(parentId);
  const isParentCategory = isEdit && !parentId && childCategories.length > 0;

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
          <p className="text-sm text-gray-500">Loading category details...</p>
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
          <Link to="/categories" className="text-gray-400 hover:text-gray-600 transition-colors">
            Categories
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
            {isEdit ? 'Edit Category' : 'New Category'}
          </span>
        </nav>

        {/* Title & Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEdit ? name || 'Edit Category' : 'Create New Category'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? 'Update category information'
                : 'Add a new category to organize your products'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/categories"
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="category-form"
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
                  <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form id="category-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <SectionCard
              title="Basic Information"
              description="Category name and URL identifier"
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
                <FormField label="Category Name" required hint="The name displayed to customers">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
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
                      /categories/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="category-slug"
                      className="w-full pl-28 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                      required
                    />
                  </div>
                </FormField>
              </div>
            </SectionCard>

            {/* Category Image */}
            <SectionCard
              title="Category Image"
              description="Visual representation for this category"
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
              <div className="space-y-4">
                {/* Image Preview */}
                {currentImageUrl && (
                  <div className="relative inline-block">
                    <img
                      src={currentImageUrl}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="%23f3f4f6"><rect width="128" height="128"/><text x="64" y="64" text-anchor="middle" dy=".3em" font-size="12" fill="%239ca3af">Invalid URL</text></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
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
                    {imageFile && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium text-white bg-gray-900/70 rounded">
                        New
                      </span>
                    )}
                  </div>
                )}

                {/* Upload Zone */}
                {!currentImageUrl && (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                      ${
                        isDragging
                          ? 'border-gray-400 bg-gray-50'
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
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                          isDragging ? 'bg-gray-200' : 'bg-gray-100'
                        }`}
                      >
                        <svg
                          className={`w-6 h-6 ${isDragging ? 'text-gray-600' : 'text-gray-400'}`}
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
                        {isDragging ? 'Drop image here' : 'Drag and drop an image'}
                      </p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                      <p className="mt-2 text-[10px] text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                )}

                {/* URL Input */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or add via URL</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
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
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
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
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Child Categories (only show for parent categories in edit mode) */}
            {isEdit && !parentId && (
              <SectionCard
                title="Subcategories"
                description={
                  childCategories.length > 0
                    ? `${childCategories.length} subcategor${childCategories.length === 1 ? 'y' : 'ies'} under this category`
                    : 'No subcategories yet'
                }
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
                {childCategories.length > 0 ? (
                  <div className="-mx-6 -mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-t border-b border-gray-100 bg-gray-50/50">
                          <th className="px-6 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-4 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            Products
                          </th>
                          <th className="px-4 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {childCategories.map((child) => (
                          <tr
                            key={child.id}
                            className="hover:bg-gray-50/50 transition-colors group"
                          >
                            <td className="px-6 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 bg-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                                  {child.imageUrl ? (
                                    <img
                                      src={child.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
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
                                        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-gray-800">
                                  {child.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex px-1.5 py-0.5 text-[10px] font-normal text-gray-500 bg-gray-100 rounded">
                                {child.slug}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span
                                className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                  (child.productCount || 0) > 0
                                    ? 'text-gray-700 bg-gray-100'
                                    : 'text-gray-400'
                                }`}
                              >
                                {child.productCount || 0}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Link
                                to={`/categories/${child.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                  />
                                </svg>
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Add Subcategory Link */}
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
                      <Link
                        to={`/categories/new?parent=${id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
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
                        Add Subcategory
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">No subcategories yet</p>
                    <Link
                      to={`/categories/new?parent=${id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                      Add Subcategory
                    </Link>
                  </div>
                )}
              </SectionCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Hierarchy */}
            <SidebarCard
              title="Hierarchy"
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
                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                  />
                </svg>
              }
            >
              <div className="space-y-4">
                <FormField
                  label="Parent Category"
                  hint="Leave empty to create a top-level category"
                >
                  <Dropdown
                    value={parentId}
                    onChange={setParentId}
                    options={parentCategoryOptions.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    placeholder="None (Top-level)"
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
                          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                        />
                      </svg>
                    }
                  />
                </FormField>

                {/* Type indicator */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`w-3 h-3 rounded-full ${isSubcategory ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isSubcategory ? 'Subcategory' : 'Parent Category'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isSubcategory
                          ? `Under "${parentCategory?.name || 'Unknown'}"`
                          : isParentCategory
                            ? `${childCategories.length} subcategor${childCategories.length === 1 ? 'y' : 'ies'}`
                            : 'Top-level category'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarCard>

            {/* Display Settings */}
            <SidebarCard
              title="Display"
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
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  />
                </svg>
              }
            >
              <FormField label="Display Order" hint="Lower numbers appear first">
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                />
              </FormField>
            </SidebarCard>

            {/* Mobile Save Button */}
            <div className="lg:hidden">
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
                  <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
                )}
              </button>
            </div>

            {/* Quick Tips */}
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
                    <li>• Use clear, descriptive names</li>
                    <li>• Square images work best (400x400px)</li>
                    <li>• Subcategories inherit parent visibility</li>
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
