import type { BankAccount } from '@lunaz/types';
import { Card, Price } from '@lunaz/ui';

interface BankTransferDetailsProps {
  bankDetails: BankAccount[];
  orderReference: string;
  amount: number;
  currency: string;
  expiresAt?: string;
  instructions?: string;
}

export function BankTransferDetails({
  bankDetails,
  orderReference,
  amount,
  currency,
  expiresAt,
  instructions,
}: BankTransferDetailsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-BD', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bank Transfer Details</h3>
        <p className="text-gray-600">
          Please transfer the exact amount to one of the accounts below
        </p>
      </div>

      {/* Amount to Transfer */}
      <div className="bg-white rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Amount to Transfer</p>
        <p className="text-3xl font-bold text-gray-900">
          <Price amount={amount} currency={currency} />
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Reference: <span className="font-mono font-semibold text-blue-600">{orderReference}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Include this reference in your transfer description
        </p>
      </div>

      {/* Bank Accounts */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900">Bank Accounts</h4>
        {bankDetails.map((account, index) => (
          <div key={account.id || index} className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">{account.bankName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Account Name</p>
                <p className="font-medium text-gray-900">{account.accountName}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number</p>
                <p className="font-mono font-medium text-gray-900">{account.accountNumber}</p>
              </div>
              {account.branchName && (
                <div>
                  <p className="text-gray-500">Branch</p>
                  <p className="font-medium text-gray-900">{account.branchName}</p>
                </div>
              )}
              {account.routingNumber && (
                <div>
                  <p className="text-gray-500">Routing Number</p>
                  <p className="font-mono font-medium text-gray-900">{account.routingNumber}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expiry Warning */}
      {expiresAt && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">Transfer Deadline</p>
              <p className="text-sm text-yellow-700">
                Please complete your transfer by <strong>{formatDate(expiresAt)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">Instructions</p>
          <p>{instructions}</p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          After completing the transfer, you can submit your receipt in your order details page.
        </p>
        <p className="mt-2">
          We will verify your payment and update your order status within 24 hours.
        </p>
      </div>
    </Card>
  );
}
