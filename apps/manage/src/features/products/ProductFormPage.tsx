import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Product, Category, PaginatedResponse, ProductStatus } from '@lunaz/types';
import { Card, Button, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface VariantForm {
  id: string;
  name: string;
  sku: string;
  priceOverride: string;
  stock: string;
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

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
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
    { id: generateId(), name: 'Default', sku: '', priceOverride: '', stock: '' },
  ]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlsToAdd, setImageUrlsToAdd] = useState<string[]>([]);

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
          product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku || '',
            priceOverride: v.priceOverride?.toString() || '',
            stock: v.stock?.toString() || '',
          }))
        );
        setExistingImages(product.images.map((img) => ({ id: img.id, url: img.url })));
      } catch {
        addToast('Failed to load product', 'error');
        navigate('/products');
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
    setVariants([...variants, { id: generateId(), name: '', sku: '', priceOverride: '', stock: '' }]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Image handling
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    try {
      new URL(imageUrl); // Validate URL
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

    // Validation
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

      // Upload new images (file uploads)
      for (const file of newImages) {
        const formData = new FormData();
        formData.append('image', file);

        await fetch(`${import.meta.env.VITE_API_URL ?? '/api/v1'}/products/${productId}/images`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // Add images via URL
      for (const url of imageUrlsToAdd) {
        await api(`/products/${productId}/images/url`, {
          method: 'POST',
          body: JSON.stringify({ url }),
          token,
        });
      }

      addToast(isEdit ? 'Product updated' : 'Product created', 'success');
      navigate('/products');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700">
            ← Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="Product Name *"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <Input
                  label="Slug *"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </Card>

            {/* Variants */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  Add Variant
                </Button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Variant {index + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Input
                        label="Name (e.g. Size)"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        size="sm"
                      />
                      <Input
                        label="SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        size="sm"
                      />
                      <Input
                        label="Price Override"
                        type="number"
                        step="0.01"
                        value={variant.priceOverride}
                        onChange={(e) => updateVariant(index, 'priceOverride', e.target.value)}
                        size="sm"
                      />
                      <Input
                        label="Stock"
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Images */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="space-y-4">
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Current Images</p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images preview (files + URLs) */}
                {(newImages.length > 0 || imageUrlsToAdd.length > 0) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">New Images to Add</p>
                    <div className="flex flex-wrap gap-3">
                      {newImages.map((file, index) => (
                        <div key={`file-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-1 rounded">
                            File
                          </span>
                        </div>
                      ))}
                      {imageUrlsToAdd.map((url, index) => (
                        <div key={`url-${index}`} className="relative group">
                          <img
                            src={url}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%23ccc"><rect width="96" height="96"/><text x="48" y="48" text-anchor="middle" dy=".3em" font-size="12">Invalid</text></svg>';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-1 left-1 text-xs bg-green-500 text-white px-1 rounded">
                            URL
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File upload */}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors h-full flex flex-col items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Upload Files</p>
                      <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                    </div>
                  </label>

                  {/* URL input */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-gray-600">Add from URL</span>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <Button type="button" size="sm" variant="outline" onClick={handleAddImageUrl}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <Button type="submit" fullWidth loading={isSaving}>
                  {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-4">
                <Input
                  label="Base Price *"
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
