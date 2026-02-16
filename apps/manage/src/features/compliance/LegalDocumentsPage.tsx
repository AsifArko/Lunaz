import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../api/client';
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

interface DropdownOption {
  value: string;
  label: string;
}

function Dropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 min-w-[160px] bg-white border rounded-md text-sm transition-colors ${
          isOpen
            ? 'border-slate-400 ring-1 ring-slate-400'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
              !value ? 'text-slate-900 bg-slate-50' : 'text-slate-500'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                value === option.value ? 'text-slate-900 bg-slate-50' : 'text-slate-600'
              }`}
            >
              {option.label}
              {value === option.value && (
                <svg
                  className="w-4 h-4 text-slate-600"
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
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

  const categoryOptions: DropdownOption[] = [
    { value: 'incorporation', label: 'Incorporation' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'employment', label: 'Employment' },
    { value: 'intellectual_property', label: 'Intellectual Property' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'financial', label: 'Financial' },
    { value: 'legal_proceedings', label: 'Legal Proceedings' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'miscellaneous', label: 'Miscellaneous' },
  ];

  const statusOptions: DropdownOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'archived', label: 'Archived' },
  ];

  useEffect(() => {
    fetchDocuments();
    // fetchDocuments depends on token which is stable from useAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchDocuments() {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const res = await fetch(`${API_URL}/compliance/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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

  const getStatusBadge = (status: string) => {
    if (status === 'expired' || status === 'terminated') {
      return 'bg-slate-900 text-white';
    }
    return 'bg-slate-100 text-slate-700';
  };

  const getAccessLevelBadge = () => {
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  const clearFilters = () => {
    setFilter({ category: '', status: '', search: '' });
  };

  const hasActiveFilters = filter.category || filter.status || filter.search;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Legal Documents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your business legal documents and contracts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear all
            </button>
          )}
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <Dropdown
            value={filter.category}
            onChange={(value) => setFilter({ ...filter, category: value })}
            options={categoryOptions}
            placeholder="All Categories"
          />
          <Dropdown
            value={filter.status}
            onChange={(value) => setFilter({ ...filter, status: value })}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">
                    Document
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Access</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">
                    Version
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">
                    Created
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-slate-500"
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                          {doc.documentNumber && (
                            <p className="text-xs text-slate-400 font-mono">{doc.documentNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">
                        {getCategoryLabel(doc.category)}
                      </span>
                      {doc.subCategory && (
                        <span className="text-xs text-slate-400 ml-1">/ {doc.subCategory}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusBadge(
                          doc.status
                        )}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getAccessLevelBadge()}`}
                      >
                        {doc.accessLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">v{doc.currentVersion}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={doc.currentFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
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
                              strokeWidth={1.5}
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                        </a>
                        <button
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                          title="View"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-slate-400"
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
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No Documents Found</h2>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No documents match your current filters.'
              : 'Start uploading your business legal documents.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Upload First Document
          </button>
        </div>
      )}

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Upload Document</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-5">
                Document upload form will be implemented here with fields for title, category,
                parties, dates, file upload, and access control settings.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-2 text-sm bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
