import { useState } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsCard } from '../../shared/SettingsCard';
import { SettingsAlert } from '../../shared/SettingsAlert';
import { SettingsDivider } from '../../shared/SettingsDivider';

export function AdvancedTab() {
  const [isClearing, setIsClearing] = useState<string | null>(null);

  const handleClearCache = async (type: string) => {
    setIsClearing(type);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsClearing(null);
  };

  return (
    <div className="space-y-8">
      <SettingsAlert variant="info">
        Advanced settings are intended for developers and administrators. Changes here may affect
        your store's functionality.
      </SettingsAlert>

      <SettingsSection title="API Keys" description="Manage API access for integrations">
        <SettingsCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">API Keys</p>
              <p className="text-xs text-gray-500">Generate keys for third-party integrations</p>
            </div>
            <button
              type="button"
              className="h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Generate New Key
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Key</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Created</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No API keys generated yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection
        title="Webhooks"
        description="Send real-time notifications to external services"
      >
        <SettingsCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Webhooks</p>
              <p className="text-xs text-gray-500">Configure webhook endpoints</p>
            </div>
            <button
              type="button"
              className="h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Add Webhook
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">URL</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Events</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No webhooks configured yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Import / Export" description="Bulk data management">
        <div className="grid grid-cols-2 gap-4">
          <SettingsCard>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Export Data</h3>
            <p className="text-xs text-gray-500 mb-4">Download your store data</p>
            <div className="space-y-2">
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Export Products (CSV)
              </button>
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Export Orders (CSV)
              </button>
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Export Customers (CSV)
              </button>
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Backup Settings (JSON)
              </button>
            </div>
          </SettingsCard>

          <SettingsCard>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Import Data</h3>
            <p className="text-xs text-gray-500 mb-4">Upload data to your store</p>
            <div className="space-y-2">
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Import Products (CSV)
              </button>
              <button className="w-full h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left">
                Restore Settings (JSON)
              </button>
            </div>
          </SettingsCard>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Cache Management" description="Clear cached data">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'page', label: 'Page Cache', desc: 'Clear cached pages' },
            { id: 'api', label: 'API Cache', desc: 'Clear API responses' },
            { id: 'image', label: 'Image Cache', desc: 'Regenerate thumbnails' },
            { id: 'all', label: 'Clear All', desc: 'Full cache purge' },
          ].map((cache) => (
            <button
              key={cache.id}
              type="button"
              onClick={() => handleClearCache(cache.id)}
              disabled={isClearing !== null}
              className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <p className="text-sm font-medium text-gray-900">{cache.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cache.desc}</p>
              {isClearing === cache.id && (
                <div className="mt-2">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection
        title="System Information"
        description="Technical details about your installation"
      >
        <SettingsCard variant="muted">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">App Version</p>
              <p className="font-medium text-gray-900">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-500">Environment</p>
              <p className="font-medium text-gray-900">Production</p>
            </div>
            <div>
              <p className="text-gray-500">Node Version</p>
              <p className="font-medium text-gray-900">18.x</p>
            </div>
            <div>
              <p className="text-gray-500">Database</p>
              <p className="font-medium text-gray-900">MongoDB 6.0</p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">Jan 31, 2026</p>
            </div>
            <div>
              <p className="text-gray-500">API Requests (Today)</p>
              <p className="font-medium text-gray-900">1,234</p>
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
}
