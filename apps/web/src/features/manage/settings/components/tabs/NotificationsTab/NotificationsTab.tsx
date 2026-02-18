import { useState } from 'react';
import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsToggle } from 'manage-settings/components/shared/SettingsToggle';
import { SettingsSaveButton } from 'manage-settings/components/shared/SettingsSaveButton';
import type { NotificationSettings } from 'manage-settings/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from 'manage-settings/utils/defaults';

interface NotificationsTabProps {
  onSave?: () => void;
}

const AdminEmailIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CustomerEmailIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ReportsIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const BrowserIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

export function NotificationsTab({ onSave }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onSave?.();
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Admin Email Notifications"
        description="Notifications sent to store administrators"
        icon={AdminEmailIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</p>
            <SettingsToggle
              label="New Orders"
              description="New order placed"
              checked={notifications.adminNewOrder}
              onChange={(v) => updateNotification('adminNewOrder', v)}
            />
            <SettingsToggle
              label="Order Cancelled"
              description="Order is cancelled"
              checked={notifications.adminOrderCancelled}
              onChange={(v) => updateNotification('adminOrderCancelled', v)}
            />
            <SettingsToggle
              label="Failed Payment"
              description="Payment fails"
              checked={notifications.adminFailedPayment}
              onChange={(v) => updateNotification('adminFailedPayment', v)}
            />
            <SettingsToggle
              label="Refund Processed"
              description="Refund is issued"
              checked={notifications.adminRefund}
              onChange={(v) => updateNotification('adminRefund', v)}
            />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Inventory & Customers
            </p>
            <SettingsToggle
              label="Low Stock Alert"
              description="Product stock is low"
              checked={notifications.adminLowStock}
              onChange={(v) => updateNotification('adminLowStock', v)}
            />
            <SettingsToggle
              label="Out of Stock"
              description="Product out of stock"
              checked={notifications.adminOutOfStock}
              onChange={(v) => updateNotification('adminOutOfStock', v)}
            />
            <SettingsToggle
              label="New Customer"
              description="Customer registers"
              checked={notifications.adminNewCustomer}
              onChange={(v) => updateNotification('adminNewCustomer', v)}
            />
            <SettingsToggle
              label="New Review"
              description="Review is submitted"
              checked={notifications.adminNewReview}
              onChange={(v) => updateNotification('adminNewReview', v)}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Customer Email Notifications"
        description="Automated emails sent to your customers"
        icon={CustomerEmailIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SettingsToggle
            label="Order Confirmation"
            description="When order is placed"
            checked={notifications.customerOrderConfirmation}
            onChange={(v) => updateNotification('customerOrderConfirmation', v)}
          />
          <SettingsToggle
            label="Order Shipped"
            description="When order ships"
            checked={notifications.customerOrderShipped}
            onChange={(v) => updateNotification('customerOrderShipped', v)}
          />
          <SettingsToggle
            label="Order Delivered"
            description="When order is delivered"
            checked={notifications.customerOrderDelivered}
            onChange={(v) => updateNotification('customerOrderDelivered', v)}
          />
          <SettingsToggle
            label="Order Cancelled"
            description="When order is cancelled"
            checked={notifications.customerOrderCancelled}
            onChange={(v) => updateNotification('customerOrderCancelled', v)}
          />
          <SettingsToggle
            label="Refund Processed"
            description="When refund is issued"
            checked={notifications.customerRefund}
            onChange={(v) => updateNotification('customerRefund', v)}
          />
        </div>
      </SettingsSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsSection
          title="Reports"
          description="Scheduled report emails"
          icon={ReportsIcon}
          iconBg="gray"
          variant="card"
        >
          <div className="space-y-3">
            <SettingsToggle
              label="Daily Summary"
              description="Daily activity report"
              checked={notifications.dailyReport}
              onChange={(v) => updateNotification('dailyReport', v)}
            />
            <SettingsToggle
              label="Weekly Report"
              description="Weekly analytics"
              checked={notifications.weeklyReport}
              onChange={(v) => updateNotification('weeklyReport', v)}
            />
            <SettingsToggle
              label="Monthly Report"
              description="Monthly summary"
              checked={notifications.monthlyReport}
              onChange={(v) => updateNotification('monthlyReport', v)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Browser Notifications"
          description="Real-time alerts"
          icon={BrowserIcon}
          iconBg="gray"
          variant="card"
        >
          <div className="space-y-3">
            <SettingsToggle
              label="Push Notifications"
              description="Browser notifications"
              checked={notifications.enableBrowserNotifications}
              onChange={(v) => updateNotification('enableBrowserNotifications', v)}
            />
            <SettingsToggle
              label="Order Sound"
              description="Sound for new orders"
              checked={notifications.orderNotificationSound}
              onChange={(v) => updateNotification('orderNotificationSound', v)}
            />
          </div>
        </SettingsSection>
      </div>

      <div className="flex justify-end pt-4">
        <SettingsSaveButton
          isLoading={isSaving}
          onClick={handleSave}
          label="Save preferences"
          type="button"
        />
      </div>
    </div>
  );
}
