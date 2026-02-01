import { useState } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import type { NotificationSettings } from '../../../types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../../utils/defaults';

interface NotificationsTabProps {
  onSave?: () => void;
}

export function NotificationsTab({ onSave }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onSave?.();
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Admin Email Notifications">
        <div className="space-y-4">
          <SettingsToggle
            label="New Orders"
            description="Receive email when a new order is placed"
            checked={notifications.adminNewOrder}
            onChange={(v) => updateNotification('adminNewOrder', v)}
          />
          <SettingsToggle
            label="Order Cancelled"
            description="Receive email when an order is cancelled"
            checked={notifications.adminOrderCancelled}
            onChange={(v) => updateNotification('adminOrderCancelled', v)}
          />
          <SettingsToggle
            label="Low Stock Alert"
            description="Receive email when product stock is low"
            checked={notifications.adminLowStock}
            onChange={(v) => updateNotification('adminLowStock', v)}
          />
          <SettingsToggle
            label="Out of Stock"
            description="Receive email when products go out of stock"
            checked={notifications.adminOutOfStock}
            onChange={(v) => updateNotification('adminOutOfStock', v)}
          />
          <SettingsToggle
            label="New Customer"
            description="Receive email when a new customer registers"
            checked={notifications.adminNewCustomer}
            onChange={(v) => updateNotification('adminNewCustomer', v)}
          />
          <SettingsToggle
            label="Failed Payment"
            description="Receive email when a payment fails"
            checked={notifications.adminFailedPayment}
            onChange={(v) => updateNotification('adminFailedPayment', v)}
          />
          <SettingsToggle
            label="Refund Processed"
            description="Receive email when a refund is processed"
            checked={notifications.adminRefund}
            onChange={(v) => updateNotification('adminRefund', v)}
          />
          <SettingsToggle
            label="New Review"
            description="Receive email when a product review is submitted"
            checked={notifications.adminNewReview}
            onChange={(v) => updateNotification('adminNewReview', v)}
          />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Customer Email Notifications" description="Emails sent to customers">
        <div className="space-y-4">
          <SettingsToggle
            label="Order Confirmation"
            description="Send confirmation when order is placed"
            checked={notifications.customerOrderConfirmation}
            onChange={(v) => updateNotification('customerOrderConfirmation', v)}
          />
          <SettingsToggle
            label="Order Shipped"
            description="Send notification when order ships"
            checked={notifications.customerOrderShipped}
            onChange={(v) => updateNotification('customerOrderShipped', v)}
          />
          <SettingsToggle
            label="Order Delivered"
            description="Send notification when order is delivered"
            checked={notifications.customerOrderDelivered}
            onChange={(v) => updateNotification('customerOrderDelivered', v)}
          />
          <SettingsToggle
            label="Order Cancelled"
            description="Send notification when order is cancelled"
            checked={notifications.customerOrderCancelled}
            onChange={(v) => updateNotification('customerOrderCancelled', v)}
          />
          <SettingsToggle
            label="Refund Processed"
            description="Send notification when refund is issued"
            checked={notifications.customerRefund}
            onChange={(v) => updateNotification('customerRefund', v)}
          />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Reports">
        <div className="space-y-4">
          <SettingsToggle
            label="Daily Summary"
            description="Receive daily activity report"
            checked={notifications.dailyReport}
            onChange={(v) => updateNotification('dailyReport', v)}
          />
          <SettingsToggle
            label="Weekly Report"
            description="Comprehensive weekly analytics"
            checked={notifications.weeklyReport}
            onChange={(v) => updateNotification('weeklyReport', v)}
          />
          <SettingsToggle
            label="Monthly Report"
            description="Monthly business summary"
            checked={notifications.monthlyReport}
            onChange={(v) => updateNotification('monthlyReport', v)}
          />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Browser Notifications">
        <div className="space-y-4">
          <SettingsToggle
            label="Push Notifications"
            description="Browser notifications for new orders"
            checked={notifications.enableBrowserNotifications}
            onChange={(v) => updateNotification('enableBrowserNotifications', v)}
          />
          <SettingsToggle
            label="Order Sound"
            description="Play sound when new order arrives"
            checked={notifications.orderNotificationSound}
            onChange={(v) => updateNotification('orderNotificationSound', v)}
          />
        </div>
      </SettingsSection>

      <div className="pt-4">
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
