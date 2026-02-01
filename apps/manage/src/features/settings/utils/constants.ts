import type { SelectOption } from '../types';
import type { SettingsTab } from '../types';

// Currency options
export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'BDT', label: 'BDT (৳) - Bangladeshi Taka' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
];

export const CURRENCY_POSITION_OPTIONS: SelectOption[] = [
  { value: 'before', label: 'Before amount ($100)' },
  { value: 'after', label: 'After amount (100$)' },
];

export const DECIMAL_SEPARATOR_OPTIONS: SelectOption[] = [
  { value: '.', label: 'Period (.)' },
  { value: ',', label: 'Comma (,)' },
];

export const THOUSANDS_SEPARATOR_OPTIONS: SelectOption[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '.', label: 'Period (.)' },
  { value: ' ', label: 'Space' },
  { value: '', label: 'None' },
];

// Timezone options
export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+1)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'America/Denver', label: 'America/Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+11)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (GMT+13)' },
];

export const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.12.2024)' },
];

export const TIME_FORMAT_OPTIONS: SelectOption[] = [
  { value: '12h', label: '12-hour (3:00 PM)' },
  { value: '24h', label: '24-hour (15:00)' },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'hi', label: 'Hindi (हिंदी)' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'zh', label: 'Chinese (中文)' },
  { value: 'ja', label: 'Japanese (日本語)' },
];

export const WEIGHT_UNIT_OPTIONS: SelectOption[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
];

export const DIMENSION_UNIT_OPTIONS: SelectOption[] = [
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'in', label: 'Inches (in)' },
  { value: 'ft', label: 'Feet (ft)' },
];

// Shipping calculation options
export const SHIPPING_CALCULATION_OPTIONS: SelectOption[] = [
  { value: 'flat', label: 'Flat rate' },
  { value: 'weight', label: 'By weight' },
  { value: 'price', label: 'By order price' },
  { value: 'items', label: 'By item count' },
];

export const OUT_OF_STOCK_DISPLAY_OPTIONS: SelectOption[] = [
  { value: 'show', label: 'Show with "Out of Stock" label' },
  { value: 'hide', label: 'Hide from store' },
];

// Country options
export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'India', label: 'India' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Japan', label: 'Japan' },
  { value: 'China', label: 'China' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
];

// Business type options
export const BUSINESS_TYPE_OPTIONS: SelectOption[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'nonprofit', label: 'Non-profit Organization' },
  { value: 'cooperative', label: 'Cooperative' },
];

export const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'health_beauty', label: 'Health & Beauty' },
  { value: 'home_garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'books', label: 'Books & Media' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' },
];

// Theme options
export const THEME_OPTIONS: SelectOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System default' },
];

export const ITEMS_PER_PAGE_OPTIONS: SelectOption[] = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

// Session timeout options (in minutes)
export const SESSION_TIMEOUT_OPTIONS: SelectOption[] = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
  { value: '1440', label: '24 hours' },
];

// Report day options
export const WEEKDAY_OPTIONS: SelectOption[] = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

// Social platforms
export const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/...' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/...' },
] as const;

// Settings tabs configuration
export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'general', label: 'General' },
  { id: 'shipping', label: 'Shipping & Tax' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'business', label: 'Business' },
  { id: 'social', label: 'Social' },
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'payment', label: 'Payment', badge: 'New', badgeVariant: 'new' },
  { id: 'advanced', label: 'Advanced', badge: 'New', badgeVariant: 'new' },
];

// Webhook event types
export const WEBHOOK_EVENTS = [
  { value: 'order.created', label: 'Order Created' },
  { value: 'order.updated', label: 'Order Updated' },
  { value: 'order.cancelled', label: 'Order Cancelled' },
  { value: 'order.completed', label: 'Order Completed' },
  { value: 'product.created', label: 'Product Created' },
  { value: 'product.updated', label: 'Product Updated' },
  { value: 'product.deleted', label: 'Product Deleted' },
  { value: 'customer.created', label: 'Customer Created' },
  { value: 'customer.updated', label: 'Customer Updated' },
  { value: 'inventory.low', label: 'Low Inventory' },
  { value: 'payment.received', label: 'Payment Received' },
  { value: 'payment.failed', label: 'Payment Failed' },
  { value: 'refund.processed', label: 'Refund Processed' },
];

// API key permissions
export const API_KEY_PERMISSIONS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
];
