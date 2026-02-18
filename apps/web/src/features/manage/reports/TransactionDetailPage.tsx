import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Payment } from 'types';
import { Price } from '@/ui';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  paid: {
    label: 'Paid',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  initiated: {
    label: 'Initiated',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  processing: {
    label: 'Processing',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  failed: { label: 'Failed', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  partially_refunded: {
    label: 'Partial Refund',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
};

function InfoSection({
  title,
  children,
  className = '',
  contentClassName = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className={`p-4 flex-1 min-h-0 ${contentClassName}`}>{children}</div>
    </div>
  );
}

function KeyValue({
  label,
  value,
  metadata,
}: {
  label: string;
  value: React.ReactNode;
  metadata?: boolean;
}) {
  if (value === undefined || value === null || value === '') return null;
  const isElement =
    typeof value === 'object' &&
    value !== null &&
    !['string', 'number', 'boolean'].includes(typeof value);
  return (
    <div className="flex items-center justify-between gap-3 py-1 first:pt-0 last:pb-0 border-b border-gray-50 last:border-0">
      <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span
        className={`break-all min-w-0 flex-1 text-right ${metadata ? 'text-[10px] text-gray-500 font-sans antialiased' : 'text-xs text-gray-900'} ${!isElement && !metadata ? 'font-mono' : ''}`}
      >
        {isElement ? value : String(value)}
      </span>
    </div>
  );
}

function CopyableUserAgent({ userAgent, onCopy }: { userAgent: string; onCopy: () => void }) {
  const preview = userAgent.length > 32 ? `${userAgent.slice(0, 32)}…` : userAgent;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(userAgent);
        onCopy();
      }}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] text-gray-500 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 cursor-pointer transition-colors"
      title="Click to copy full user agent"
    >
      <svg
        className="w-3 h-3 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        />
      </svg>
      <span className="truncate max-w-[180px]">{preview}</span>
    </button>
  );
}

function formatGatewayPaymentId(id: string | undefined): string {
  if (!id) return '—';
  return id.startsWith('TXN_LN-') ? id.slice(7) : id;
}

function formatJsonWithExtraIndent(data: Record<string, unknown>): string {
  const jsonStr = JSON.stringify(data, null, 4);
  const lines = jsonStr.split('\n');
  if (lines.length <= 2) return jsonStr;
  return [lines[0], ...lines.slice(1, -1).map((line) => ' ' + line), lines[lines.length - 1]].join(
    '\n'
  );
}

function JsonBlock({
  data,
  title,
  fullHeight,
}: {
  data: Record<string, unknown>;
  title?: string;
  fullHeight?: boolean;
}) {
  return (
    <div className={`flex flex-col ${fullHeight ? 'flex-1 min-h-0' : ''} space-y-2`}>
      {title && (
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide shrink-0">
          {title}
        </span>
      )}
      <pre
        className={`p-3 bg-gray-50/80 rounded-lg overflow-x-auto overflow-y-auto font-sans antialiased text-[10px] text-gray-500 ${
          fullHeight ? 'flex-1 min-h-0' : 'max-h-64'
        }`}
      >
        {formatJsonWithExtraIndent(data)}
      </pre>
    </div>
  );
}

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const { addToast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayment() {
      if (!token || !id) return;
      setIsLoading(true);
      try {
        const data = await api<Payment>(`/payments/${id}`, { token });
        setPayment(data);
      } catch {
        addToast('Failed to load transaction', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayment();
  }, [token, id, addToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Loading transaction...
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Transaction not found</p>
        <Link to="/manage/transactions" className="text-sm text-gray-900 hover:underline">
          ← Back to Transactions
        </Link>
      </div>
    );
  }

  const statusStyle = statusConfig[payment.status] || statusConfig.pending;
  const gatewayResponse = payment.gatewayResponse as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/manage/transactions"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Transactions"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Transaction Details</h1>
            <p className="mt-0.5 text-[11px] text-gray-500 font-mono">{payment.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${statusStyle.bgColor} ${statusStyle.textColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.color}`} />
            {statusStyle.label}
          </span>
          <Price
            amount={payment.amount}
            currency={payment.currency}
            className="text-base font-semibold text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview */}
        <InfoSection title="Overview">
          <div className="space-y-0">
            <KeyValue
              label="Transaction ID"
              value={
                <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-100 rounded">
                  {payment.id}
                </span>
              }
              metadata
            />
            <KeyValue
              label="Gateway Payment ID"
              value={
                payment.gatewayPaymentId ? (
                  <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-100 rounded">
                    {formatGatewayPaymentId(payment.gatewayPaymentId)}
                  </span>
                ) : undefined
              }
              metadata
            />
            <KeyValue
              label="Gateway Transaction ID"
              value={payment.gatewayTransactionId}
              metadata
            />
            <KeyValue label="Method" value={payment.method?.replace(/_/g, ' ')} metadata />
            <KeyValue label="Status" value={payment.status} metadata />
            <KeyValue
              label="Amount"
              value={
                <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded">
                  <Price amount={payment.amount} currency={payment.currency} />
                </span>
              }
              metadata
            />
            <KeyValue label="Currency" value={payment.currency} metadata />
          </div>
        </InfoSection>

        {/* Order & Customer */}
        <InfoSection title="Order & Customer">
          <div className="space-y-0">
            <KeyValue
              label="Customer Name"
              value={
                payment.userId ? (
                  <Link
                    to={`/manage/customers/${payment.userId}`}
                    className="text-xs font-medium text-gray-900 hover:text-gray-600 hover:underline"
                  >
                    {payment.customerName || payment.userId}
                  </Link>
                ) : payment.customerName ? (
                  <span className="text-xs text-gray-900">{payment.customerName}</span>
                ) : (
                  '—'
                )
              }
            />
            <KeyValue label="Customer Email" value={payment.customerEmail} metadata />
            <KeyValue label="Phone" value={payment.customerPhone} metadata />
            <KeyValue
              label="Order"
              value={
                payment.orderId ? (
                  <Link
                    to={`/manage/orders/${payment.orderId}`}
                    className="text-xs font-medium text-gray-900 hover:text-gray-600 hover:underline"
                  >
                    #{payment.orderNumber || payment.orderId}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
          </div>
        </InfoSection>

        {/* Card Info (if present) */}
        {payment.card && (
          <InfoSection title="Card Details">
            <div className="space-y-0">
              <KeyValue
                label="Card Type"
                value={
                  payment.card.cardType ? (
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-100 rounded">
                      {payment.card.cardType}
                    </span>
                  ) : undefined
                }
                metadata
              />
              <KeyValue label="Card Brand" value={payment.card.cardBrand} metadata />
              <KeyValue label="Card Issuer" value={payment.card.cardIssuer} metadata />
              <KeyValue label="Card No (masked)" value={payment.card.cardNo} metadata />
              <KeyValue
                label="Card Issuer Country"
                value={payment.card.cardIssuerCountry}
                metadata
              />
              <KeyValue label="Transaction ID" value={payment.card.transactionId} metadata />
              <KeyValue label="Validation ID" value={payment.card.validationId} metadata />
            </div>
          </InfoSection>
        )}

        {/* bKash (if present) */}
        {payment.bkash && (
          <InfoSection title="bKash Details">
            <div className="space-y-0">
              <KeyValue label="Payment ID" value={payment.bkash.paymentID} />
              <KeyValue label="Transaction ID" value={payment.bkash.trxID} />
              <KeyValue label="Agreement ID" value={payment.bkash.agreementID} />
              <KeyValue label="Payer Reference" value={payment.bkash.payerReference} />
              <KeyValue label="Customer MSISDN" value={payment.bkash.customerMsisdn} />
            </div>
          </InfoSection>
        )}

        {/* Nagad (if present) */}
        {payment.nagad && (
          <InfoSection title="Nagad Details">
            <div className="space-y-0">
              <KeyValue label="Payment Ref ID" value={payment.nagad.paymentRefId} />
              <KeyValue label="Order ID" value={payment.nagad.orderId} />
              <KeyValue label="Issuer Payment Ref No" value={payment.nagad.issuerPaymentRefNo} />
              <KeyValue label="Client Mobile No" value={payment.nagad.clientMobileNo} />
            </div>
          </InfoSection>
        )}

        {/* Bank Transfer (if present) */}
        {payment.bankTransfer && (
          <InfoSection title="Bank Transfer Details">
            <div className="space-y-0">
              <KeyValue label="Bank Name" value={payment.bankTransfer.bankName} />
              <KeyValue label="Account Number" value={payment.bankTransfer.accountNumber} />
              <KeyValue
                label="Transaction Reference"
                value={payment.bankTransfer.transactionReference}
              />
              <KeyValue label="Transfer Date" value={payment.bankTransfer.transferDate} />
              <KeyValue label="Notes" value={payment.bankTransfer.notes} />
            </div>
          </InfoSection>
        )}

        {/* Device & Timestamps */}
        <InfoSection title="Device & Timestamps">
          <div className="space-y-0">
            <KeyValue label="IP Address" value={payment.ipAddress} metadata />
            <KeyValue
              label="User Agent"
              value={
                payment.userAgent ? (
                  <CopyableUserAgent
                    userAgent={payment.userAgent}
                    onCopy={() => addToast('User agent copied to clipboard', 'success')}
                  />
                ) : undefined
              }
            />
            <KeyValue
              label="Created At"
              value={payment.createdAt ? new Date(payment.createdAt).toLocaleString() : undefined}
              metadata
            />
            <KeyValue
              label="Updated At"
              value={payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : undefined}
              metadata
            />
            <KeyValue
              label="Expires At"
              value={payment.expiresAt ? new Date(payment.expiresAt).toLocaleString() : undefined}
              metadata
            />
          </div>
        </InfoSection>

        {/* Gateway Response (if present) */}
        {gatewayResponse && Object.keys(gatewayResponse).length > 0 && (
          <InfoSection
            title="Gateway Response"
            className="lg:min-h-[320px]"
            contentClassName="flex flex-col"
          >
            <JsonBlock data={gatewayResponse} fullHeight />
          </InfoSection>
        )}

        {/* Refund (if present) */}
        {payment.refund && (
          <InfoSection title="Refund">
            <div className="space-y-0">
              <KeyValue
                label="Refund Amount"
                value={<Price amount={payment.refund.amount} currency={payment.currency} />}
              />
              <KeyValue
                label="Refunded At"
                value={
                  payment.refund.refundedAt
                    ? new Date(payment.refund.refundedAt).toLocaleString()
                    : undefined
                }
                metadata
              />
              <KeyValue label="Reason" value={payment.refund.reason} />
            </div>
          </InfoSection>
        )}

        {/* Failure (if present) */}
        {payment.failureReason && (
          <InfoSection title="Failure">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700">{payment.failureReason}</p>
            </div>
          </InfoSection>
        )}
      </div>
    </div>
  );
}
