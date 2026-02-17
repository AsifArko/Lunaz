import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Order } from '@lunaz/types';
import { Container, Card, Button, Price } from '@/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId || !token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api<Order>(`/orders/${orderId}`, { token });
        setOrder(data);
      } catch {
        // Order might not be accessible
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="py-8">
        <Container maxWidth="md">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-48 bg-gray-200 rounded-lg" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container maxWidth="md">
        <Card className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">
                    <Price amount={order.total} currency={order.currency} />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && (
              <Link to={`/account/orders/${orderId}`}>
                <Button variant="primary">View Order</Button>
              </Link>
            )}
            <Link to="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
