import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Product, Category, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Price, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
};

export function ProductsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const categoryId = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    api<PaginatedResponse<Category>>('/categories', { token: token! }).then((res) => {
      setCategories(res.data);
    });
  }, [token]);

  useEffect(() => {
    async function fetchProducts() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '10');
        params.set('sort', 'createdAt');
        params.set('order', 'desc');
        if (status) params.set('status', status);
        if (categoryId) params.set('category', categoryId);
        if (search) params.set('search', search);

        const res = await api<PaginatedResponse<Product>>(`/products?${params.toString()}`, { token });
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        addToast('Failed to load products', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [token, page, status, categoryId, search]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!updates.page) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api(`/products/${id}`, { method: 'DELETE', token });
      addToast('Product deleted', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      addToast('Failed to delete product', 'error');
    }
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
            />
          </div>
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {(search || status || categoryId) && (
            <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link to="/products/new">
              <Button>Add First Product</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                            {product.images[0] ? (
                              <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                —
                              </div>
                            )}
                          </div>
                          <div>
                            <Link to={`/products/${product.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                              {product.name}
                            </Link>
                            <p className="text-sm text-gray-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="px-4 py-4">
                        <Price amount={product.basePrice} currency={product.currency} className="font-medium" />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.variants.length}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[product.status]}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/products/${product.id}`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {products.length} of {total} products
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
