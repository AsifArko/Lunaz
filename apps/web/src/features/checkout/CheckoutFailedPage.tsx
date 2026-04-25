import { useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Button } from '@/ui';

export function CheckoutFailedPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="py-8">
      <Container maxWidth="md">
        <Card className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            Unfortunately, your payment could not be processed. Please try again or use a different
            payment method.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-left">
                <p className="font-medium text-yellow-800">What you can do:</p>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                  <li>Check your payment details and try again</li>
                  <li>Try a different payment method</li>
                  <li>Contact your bank if the issue persists</li>
                  <li>Contact our support team for assistance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId ? (
              <Link to={`/account/orders/${orderId}`}>
                <Button variant="primary">Try Again</Button>
              </Link>
            ) : (
              <Link to="/checkout">
                <Button variant="primary">Return to Checkout</Button>
              </Link>
            )}
            <Link to="/cart">
              <Button variant="outline">Back to Cart</Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help?{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-700">
              Contact Support
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
