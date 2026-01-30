import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Category, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Input } from '@lunaz/ui';
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

export function CategoryFormPage() {
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
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState('');

  // Fetch all categories for parent dropdown
  useEffect(() => {
    if (token) {
      api<PaginatedResponse<Category>>('/categories', { token }).then((res) => {
        setCategories(res.data.filter((c) => c.id !== id)); // Exclude self from parent options
      });
    }
  }, [token, id]);

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

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) {
      setSlug(slugify(value));
    }
  };

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
        addToast('Category updated', 'success');
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
          token,
        });
        addToast('Category created', 'success');
      }

      navigate('/categories');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save category', 'error');
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
      <div className="mb-6">
        <Link to="/categories" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? 'Edit Category' : 'New Category'}
        </h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name *"
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
                Parent Category (optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Top-level)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Image URL (optional)"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Display Order (optional)"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="0"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={isSaving}>
                {isEdit ? 'Update Category' : 'Create Category'}
              </Button>
              <Link to="/categories">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
