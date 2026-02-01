import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardData {
  complianceScore: number;
  taxSummary: {
    total: number;
    paid: number;
    balance: number;
  };
  expiringSoon: Array<{
    _id: string;
    name: string;
    certificateType: string;
    expiryDate: string;
  }>;
  pendingActions: {
    pendingTaxPayments: number;
    overdueTaxPayments: number;
    expiringCertificates: number;
  };
  counts: {
    activeCertificates: number;
    totalDocuments: number;
  };
  recentActivity: Array<{
    _id: string;
    activityType: string;
    description: string;
    createdAt: string;
    performedBy?: { name: string };
  }>;
}

export function ComplianceDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/compliance/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-slate-900';
    if (score >= 60) return 'text-slate-700';
    return 'text-slate-900';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your business compliance status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Score */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Compliance Score</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-semibold ${getScoreColor(data?.complianceScore || 0)}`}>
              {data?.complianceScore || 0}%
            </p>
            <span className="text-xs text-slate-400">
              {getScoreStatus(data?.complianceScore || 0)}
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Expiring Soon</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">
              {data?.pendingActions?.expiringCertificates || 0}
            </p>
            <span className="text-xs text-slate-400">certificates</span>
          </div>
        </div>

        {/* Pending Tax */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Pending Payments</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">
              {data?.pendingActions?.pendingTaxPayments || 0}
            </p>
            <span className="text-xs text-slate-400">tax records</span>
          </div>
        </div>

        {/* Tax Balance */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Tax Balance Due</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {formatCurrency(data?.taxSummary?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Expiring Certificates */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-medium text-slate-900">Expiring Certificates</h2>
            <Link
              to="/compliance/certificates"
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              View all
            </Link>
          </div>
          {data?.expiringSoon && data.expiringSoon.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.expiringSoon.map((cert) => {
                const daysLeft = getDaysUntil(cert.expiryDate);
                return (
                  <div key={cert._id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {cert.certificateType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          daysLeft <= 7 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {daysLeft} days
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(cert.expiryDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <svg
                className="w-10 h-10 mx-auto text-slate-200 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">No certificates expiring soon</p>
            </div>
          )}
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-2">
              <Link
                to="/compliance/income-tax"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="text-sm text-slate-600">Add Tax Record</span>
              </Link>
              <Link
                to="/compliance/certificates"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="text-sm text-slate-600">Add Certificate</span>
              </Link>
              <Link
                to="/compliance/documents"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm text-slate-600">Upload Document</span>
              </Link>
              <Link
                to="/compliance/authenticity"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
                <span className="text-sm text-slate-600">Update Business Info</span>
              </Link>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Overview</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Active Certificates</span>
                <span className="text-sm font-medium text-slate-900">
                  {data?.counts?.activeCertificates || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Documents</span>
                <span className="text-sm font-medium text-slate-900">
                  {data?.counts?.totalDocuments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Overdue Payments</span>
                <span
                  className={`text-sm font-medium ${(data?.pendingActions?.overdueTaxPayments || 0) > 0 ? 'text-slate-900' : 'text-slate-900'}`}
                >
                  {data?.pendingActions?.overdueTaxPayments || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-medium text-slate-900">Recent Activity</h2>
        </div>
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activity.performedBy?.name} · {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
