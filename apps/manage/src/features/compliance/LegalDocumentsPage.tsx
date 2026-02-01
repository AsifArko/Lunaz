import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LegalDocument {
  _id: string;
  title: string;
  documentNumber?: string;
  category: string;
  subCategory?: string;
  description?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status: string;
  currentVersion: number;
  currentFile: string;
  accessLevel: string;
  tags?: string[];
  createdAt: string;
}

export function LegalDocumentsPage() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    status: '',
    search: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  async function fetchDocuments() {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/compliance/documents?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      incorporation: 'Incorporation',
      contracts: 'Contracts',
      employment: 'Employment',
      intellectual_property: 'Intellectual Property',
      real_estate: 'Real Estate',
      financial: 'Financial',
      legal_proceedings: 'Legal Proceedings',
      compliance: 'Compliance',
      insurance: 'Insurance',
      miscellaneous: 'Miscellaneous',
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      incorporation: '🏢',
      contracts: '📝',
      employment: '👥',
      intellectual_property: '💡',
      real_estate: '🏠',
      financial: '💰',
      legal_proceedings: '⚖️',
      compliance: '✅',
      insurance: '🛡️',
      miscellaneous: '📁',
    };
    return icons[category] || '📄';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-800',
      active: 'bg-emerald-100 text-emerald-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-orange-100 text-orange-800',
      superseded: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-800';
  };

  const getAccessLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      public: 'bg-blue-100 text-blue-800',
      internal: 'bg-slate-100 text-slate-800',
      restricted: 'bg-yellow-100 text-yellow-800',
      confidential: 'bg-red-100 text-red-800',
    };
    return styles[level] || 'bg-slate-100 text-slate-800';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Legal Documents</h1>
          <p className="text-slate-500 mt-1">Manage your business legal documents and contracts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search documents..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="incorporation">Incorporation</option>
            <option value="contracts">Contracts</option>
            <option value="employment">Employment</option>
            <option value="intellectual_property">Intellectual Property</option>
            <option value="real_estate">Real Estate</option>
            <option value="financial">Financial</option>
            <option value="legal_proceedings">Legal Proceedings</option>
            <option value="compliance">Compliance</option>
            <option value="insurance">Insurance</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(doc.category)}</span>
                      <div>
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        {doc.documentNumber && (
                          <p className="text-sm text-slate-500 font-mono">{doc.documentNumber}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {getCategoryLabel(doc.category)}
                    {doc.subCategory && (
                      <span className="text-slate-400"> / {doc.subCategory}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        doc.status
                      )}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getAccessLevelBadge(
                        doc.accessLevel
                      )}`}
                    >
                      {doc.accessLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">v{doc.currentVersion}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(doc.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={doc.currentFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        title="Download"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                      <button className="text-slate-600 hover:text-slate-700" title="View">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No Documents Found</h2>
          <p className="text-slate-500 mb-6">
            {filter.category || filter.status || filter.search
              ? 'No documents match your current filters.'
              : 'Start uploading your business legal documents.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload First Document
          </button>
        </div>
      )}

      {/* Upload Form Modal Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Document</h2>
            <p className="text-slate-500 mb-4">
              Document upload form will be implemented here with fields for title, category, parties,
              dates, file upload, and access control settings.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
