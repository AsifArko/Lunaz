import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Category, PaginatedResponse } from '@lunaz/types';
import { Card, Button } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CategoriesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      if (!token) return;
      try {
        const res = await api<PaginatedResponse<Category>>('/categories', { token });
        setCategories(res.data);
      } catch {
        addToast('Failed to load categories', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api(`/categories/${id}`, { method: 'DELETE', token });
      addToast('Category deleted', 'success');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      addToast('Failed to delete category', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Link to="/categories/new">
          <Button>Add Category</Button>
        </Link>
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No categories found</p>
            <Link to="/categories/new">
              <Button>Add First Category</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                        <Link
                          to={`/categories/${category.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {category.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {category.slug}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {category.parentId
                        ? categories.find((c) => c.id === category.parentId)?.name || '—'
                        : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/categories/${category.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
