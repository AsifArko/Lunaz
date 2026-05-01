# Lunaz — Settings Page Specification

## Table of Contents

1. [Overview](#1-overview)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture Design](#3-architecture-design)
4. [Component Structure](#4-component-structure)
5. [Tab Specifications](#5-tab-specifications)
6. [Backend Enhancements](#6-backend-enhancements)
7. [Shared UI Components](#7-shared-ui-components)
8. [State Management](#8-state-management)
9. [API Integration](#9-api-integration)
10. [Validation & Error Handling](#10-validation--error-handling)
11. [Implementation Phases](#11-implementation-phases)
12. [File Structure](#12-file-structure)

---

## 1. Overview

### 1.1 Purpose

The Settings Page is the centralized configuration hub for the Lunaz e-commerce admin panel. It allows administrators to configure store settings, manage their account, set up integrations, and control various aspects of the e-commerce platform.

### 1.2 Goals

- **Modularity:** Break the monolithic 1000+ line component into smaller, reusable, maintainable components
- **Functionality:** Make all settings fully functional with proper backend integration
- **Extensibility:** Design for easy addition of new settings sections
- **Professional UI:** Enterprise-grade interface with consistent design patterns
- **Type Safety:** Full TypeScript coverage with shared types
- **Performance:** Optimized rendering with proper state management

### 1.3 Design Principles

- **Separation of Concerns:** Each settings section is an independent module
- **Single Responsibility:** Components do one thing well
- **DRY (Don't Repeat Yourself):** Shared components for common patterns
- **Progressive Enhancement:** Core functionality works, enhanced features are optional
- **Accessibility:** WCAG 2.1 AA compliance

---

## 2. Current State Analysis

### 2.1 Current Issues

| Issue                       | Description                        | Impact                             |
| --------------------------- | ---------------------------------- | ---------------------------------- |
| Monolithic File             | 1009 lines in single file          | Hard to maintain, test, and extend |
| Limited Backend Integration | Only basic settings saved          | Most settings are client-side only |
| Mixed Concerns              | UI, logic, and state intertwined   | Difficult to reuse or modify       |
| Incomplete Functionality    | Many features non-functional       | Poor user experience               |
| No Validation               | Client-side validation missing     | Data integrity issues              |
| Hardcoded Data              | Static options, no dynamic loading | Inflexible configuration           |

### 2.2 Current Features (7 Tabs)

1. **General** - Store info, regional settings, feature toggles
2. **Shipping & Tax** - Shipping rates, tax configuration, order settings
3. **Notifications** - Email notifications, reports, browser notifications
4. **Business** - Legal name, address, tax information
5. **Social** - Social media links
6. **Account** - Admin profile, sessions
7. **Security** - Password change, 2FA, danger zone

### 2.3 Backend Capabilities

Current backend supports:

- `storeName`, `storeEmail`, `supportEmail`, `currency`
- `freeShippingThreshold`, `flatShippingRate`
- `taxRate`, `taxIncludedInPrices`
- `orderPrefix`, `allowGuestCheckout`, `requireEmailVerification`

---

## 3. Architecture Design

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SettingsPage                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SettingsLayout                        │   │
│  │  ┌──────────────┐  ┌─────────────────────────────────┐  │   │
│  │  │ SettingsTabs │  │      SettingsContent            │  │   │
│  │  │              │  │  ┌───────────────────────────┐  │  │   │
│  │  │  - General   │  │  │    Active Tab Component   │  │  │   │
│  │  │  - Shipping  │  │  │                           │  │  │   │
│  │  │  - Notify    │  │  │   Uses: SettingsSection   │  │  │   │
│  │  │  - Business  │  │  │         SettingsField     │  │  │   │
│  │  │  - Social    │  │  │         FormControls      │  │  │   │
│  │  │  - Account   │  │  │                           │  │  │   │
│  │  │  - Security  │  │  └───────────────────────────┘  │  │   │
│  │  │  - Payment   │  │                                 │  │   │
│  │  │  - Advanced  │  │                                 │  │   │
│  │  └──────────────┘  └─────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐
│ API Call │───▶│ useSettings  │───▶│ Settings     │───▶│ Backend │
│          │◀───│   Hook       │◀───│ Context      │◀───│   API   │
└──────────┘    └──────────────┘    └──────────────┘    └─────────┘
                       │
                       ▼
               ┌──────────────┐
               │  Tab         │
               │  Components  │
               └──────────────┘
```

### 3.3 State Management Strategy

- **Global Settings State:** React Context for shared settings data
- **Local Form State:** Individual hooks per tab for form handling
- **Async State:** React Query or custom hooks for API calls
- **Optimistic Updates:** Immediate UI feedback with rollback on error

---

## 4. Component Structure

### 4.1 Directory Structure

```
apps/manage/src/features/settings/
├── index.ts                          # Public exports
├── SettingsPage.tsx                  # Main page component (minimal)
├── components/
│   ├── layout/
│   │   ├── SettingsLayout.tsx        # Page layout wrapper
│   │   ├── SettingsTabs.tsx          # Tab navigation
│   │   ├── SettingsHeader.tsx        # Page header
│   │   └── SettingsContent.tsx       # Content area
│   ├── shared/
│   │   ├── SettingsSection.tsx       # Section wrapper with title
│   │   ├── SettingsField.tsx         # Label + input row
│   │   ├── SettingsToggle.tsx        # Toggle with description
│   │   ├── SettingsDivider.tsx       # Section divider
│   │   ├── SettingsSaveButton.tsx    # Save button with loading
│   │   ├── SettingsCard.tsx          # Card container
│   │   └── SettingsAlert.tsx         # Alert/info banner
│   ├── form/
│   │   ├── TextInput.tsx             # Text input component
│   │   ├── NumberInput.tsx           # Number input with formatting
│   │   ├── SelectInput.tsx           # Dropdown select
│   │   ├── TextArea.tsx              # Multi-line text
│   │   ├── Toggle.tsx                # Toggle switch
│   │   ├── FileUpload.tsx            # File/image upload
│   │   ├── ColorPicker.tsx           # Color selection
│   │   └── PasswordInput.tsx         # Password with visibility
│   └── tabs/
│       ├── GeneralTab/
│       │   ├── index.ts
│       │   ├── GeneralTab.tsx
│       │   ├── StoreInfoSection.tsx
│       │   ├── RegionalSection.tsx
│       │   ├── FeaturesSection.tsx
│       │   └── useGeneralSettings.ts
│       ├── ShippingTab/
│       │   ├── index.ts
│       │   ├── ShippingTab.tsx
│       │   ├── ShippingRatesSection.tsx
│       │   ├── ShippingZonesSection.tsx
│       │   ├── TaxSection.tsx
│       │   ├── OrderSettingsSection.tsx
│       │   └── useShippingSettings.ts
│       ├── NotificationsTab/
│       │   ├── index.ts
│       │   ├── NotificationsTab.tsx
│       │   ├── EmailNotificationsSection.tsx
│       │   ├── ReportsSection.tsx
│       │   ├── BrowserNotificationsSection.tsx
│       │   ├── WebhooksSection.tsx
│       │   └── useNotificationSettings.ts
│       ├── BusinessTab/
│       │   ├── index.ts
│       │   ├── BusinessTab.tsx
│       │   ├── BusinessInfoSection.tsx
│       │   ├── TaxInfoSection.tsx
│       │   ├── BankingSection.tsx
│       │   └── useBusinessSettings.ts
│       ├── SocialTab/
│       │   ├── index.ts
│       │   ├── SocialTab.tsx
│       │   ├── SocialLinksSection.tsx
│       │   ├── SocialPreviewSection.tsx
│       │   └── useSocialSettings.ts
│       ├── AccountTab/
│       │   ├── index.ts
│       │   ├── AccountTab.tsx
│       │   ├── ProfileSection.tsx
│       │   ├── AvatarSection.tsx
│       │   ├── SessionsSection.tsx
│       │   └── useAccountSettings.ts
│       ├── SecurityTab/
│       │   ├── index.ts
│       │   ├── SecurityTab.tsx
│       │   ├── PasswordSection.tsx
│       │   ├── TwoFactorSection.tsx
│       │   ├── LoginHistorySection.tsx
│       │   ├── DangerZoneSection.tsx
│       │   └── useSecuritySettings.ts
│       ├── PaymentTab/           # NEW TAB
│       │   ├── index.ts
│       │   ├── PaymentTab.tsx
│       │   ├── PaymentMethodsSection.tsx
│       │   ├── PaymentGatewaysSection.tsx
│       │   └── usePaymentSettings.ts
│       └── AdvancedTab/          # NEW TAB
│           ├── index.ts
│           ├── AdvancedTab.tsx
│           ├── APIKeysSection.tsx
│           ├── WebhooksSection.tsx
│           ├── ImportExportSection.tsx
│           ├── CacheSection.tsx
│           └── useAdvancedSettings.ts
├── hooks/
│   ├── useSettings.ts              # Main settings hook
│   ├── useSettingsForm.ts          # Form state management
│   ├── useUnsavedChanges.ts        # Track unsaved changes
│   └── useSettingsValidation.ts    # Validation logic
├── context/
│   ├── SettingsContext.tsx         # Settings provider
│   └── SettingsFormContext.tsx     # Form state provider
├── types/
│   ├── index.ts                    # All type exports
│   ├── settings.types.ts           # Settings interfaces
│   ├── tabs.types.ts               # Tab configuration types
│   └── form.types.ts               # Form-related types
├── utils/
│   ├── validators.ts               # Validation functions
│   ├── formatters.ts               # Value formatters
│   ├── constants.ts                # Static data & options
│   └── defaults.ts                 # Default values
└── api/
    ├── settings.api.ts             # Settings API calls
    └── types.ts                    # API types
```

### 4.2 Component Hierarchy

```
SettingsPage
├── SettingsLayout
│   ├── SettingsHeader
│   │   ├── Title
│   │   └── Description
│   ├── SettingsTabs
│   │   └── TabButton (×9)
│   └── SettingsContent
│       └── [ActiveTabComponent]
│           ├── SettingsSection
│           │   ├── SectionHeader
│           │   └── SectionContent
│           │       └── SettingsField (×n)
│           │           ├── Label
│           │           └── [FormControl]
│           └── SettingsSaveButton
```

---

## 5. Tab Specifications

### 5.1 General Tab

#### Purpose

Core store configuration including identity, regional settings, and feature toggles.

#### Sections

**5.1.1 Store Information**
| Field | Type | Validation | Backend Field |
|-------|------|------------|---------------|
| Store Name | text | Required, 1-100 chars | `storeName` |
| Store Description | textarea | Max 500 chars | `storeDescription` |
| Contact Email | email | Valid email | `storeEmail` |
| Support Email | email | Valid email | `supportEmail` |
| Phone Number | tel | Valid phone format | `phone` |
| Store Logo | file | Image, max 2MB | `logoUrl` |
| Favicon | file | Image, max 500KB, .ico/.png | `faviconUrl` |

**5.1.2 Regional Settings**
| Field | Type | Options | Backend Field |
|-------|------|---------|---------------|
| Currency | select | BDT, USD, EUR, GBP, INR, etc. | `currency` |
| Currency Position | select | Before ($100), After (100$) | `currencyPosition` |
| Decimal Separator | select | Period (.), Comma (,) | `decimalSeparator` |
| Thousands Separator | select | Comma (,), Period (.), Space | `thousandsSeparator` |
| Timezone | select | All timezones | `timezone` |
| Date Format | select | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | `dateFormat` |
| Time Format | select | 12h, 24h | `timeFormat` |
| Default Language | select | English, Bengali, etc. | `defaultLanguage` |
| Weight Unit | select | kg, lb, g, oz | `weightUnit` |
| Dimension Unit | select | cm, in, m, ft | `dimensionUnit` |

**5.1.3 Features**
| Feature | Default | Description |
|---------|---------|-------------|
| Product Reviews | On | Allow customers to review products |
| Customer Wishlist | On | Enable wishlist functionality |
| Quick View | On | Product quick view in listings |
| Compare Products | Off | Product comparison feature |
| Guest Checkout | On | Allow checkout without account |
| Customer Registration | On | Allow new customer signups |
| Email Verification | Off | Require email verification |
| Maintenance Mode | Off | Show maintenance page to visitors |

**5.1.4 SEO Settings**
| Field | Type | Description |
|-------|------|-------------|
| Meta Title | text | Default page title |
| Meta Description | textarea | Default meta description |
| Meta Keywords | tags | Comma-separated keywords |
| Google Analytics ID | text | GA4 tracking ID |
| Facebook Pixel ID | text | Facebook pixel tracking |
| Google Tag Manager | text | GTM container ID |

---

### 5.2 Shipping & Tax Tab

#### Purpose

Configure shipping methods, rates, zones, and tax rules.

#### Sections

**5.2.1 Shipping Rates**
| Field | Type | Validation |
|-------|------|------------|
| Free Shipping Threshold | number | Min 0 |
| Standard Shipping Rate | number | Min 0 |
| Express Shipping Rate | number | Min 0 |
| Same Day Delivery Rate | number | Min 0 |
| Calculate By | select | Flat rate, Weight, Price, Item count |

**5.2.2 Shipping Zones** (NEW)
| Column | Type | Description |
|--------|------|-------------|
| Zone Name | text | e.g., "Dhaka City" |
| Regions | multi-select | Districts/areas covered |
| Shipping Methods | checkboxes | Available methods for zone |
| Rates | number[] | Method-specific rates |
| Delivery Time | text | e.g., "1-2 days" |
| Active | toggle | Enable/disable zone |

**5.2.3 Tax Settings**
| Field | Type | Description |
|-------|------|-------------|
| Enable Tax | toggle | Master tax toggle |
| Tax Rate | number | Default percentage |
| Tax Included in Prices | toggle | Prices include tax |
| Display Tax in Cart | toggle | Show tax breakdown |
| Tax Label | text | e.g., "VAT", "GST", "Sales Tax" |
| Tax Number Display | toggle | Show tax ID on invoices |

**5.2.4 Tax Rules** (NEW)
| Column | Type | Description |
|--------|------|-------------|
| Region | select | Country/state |
| Tax Name | text | e.g., "State Tax" |
| Tax Rate | number | Percentage |
| Priority | number | Calculation order |
| Compound | toggle | Apply on top of other taxes |

**5.2.5 Order Settings**
| Field | Type | Description |
|-------|------|-------------|
| Order Prefix | text | e.g., "ORD", "LN" |
| Order Number Start | number | Starting order number |
| Auto-confirm Orders | toggle | Skip manual confirmation |
| Low Stock Threshold | number | Alert threshold |
| Out of Stock Display | select | Hide, Show with label |
| Backorder Allowed | toggle | Allow backorders |
| Minimum Order Amount | number | Minimum cart value |
| Maximum Order Items | number | Max items per order |

---

### 5.3 Notifications Tab

#### Purpose

Configure email notifications, reports, and real-time alerts.

#### Sections

**5.3.1 Email Notifications (Admin)**
| Notification | Default | Trigger |
|--------------|---------|---------|
| New Order | On | Order placed |
| Order Cancelled | On | Order cancelled |
| Low Stock Alert | On | Stock below threshold |
| Out of Stock | On | Product out of stock |
| New Customer | Off | Customer registration |
| Failed Payment | On | Payment failure |
| Refund Processed | On | Refund completed |
| New Review | Off | Product review submitted |

**5.3.2 Email Notifications (Customer)**
| Notification | Default | Trigger |
|--------------|---------|---------|
| Order Confirmation | On | Order placed |
| Order Shipped | On | Status → Shipped |
| Order Delivered | On | Status → Delivered |
| Order Cancelled | On | Order cancelled |
| Refund Processed | On | Refund issued |
| Password Reset | On | Password reset request |
| Account Created | On | Registration complete |

**5.3.3 Reports**
| Report | Options | Description |
|--------|---------|-------------|
| Daily Summary | Time, Recipients | Daily sales summary |
| Weekly Report | Day, Recipients | Weekly analytics |
| Monthly Report | Date, Recipients | Monthly business report |
| Low Stock Report | Frequency | Inventory alerts |

**5.3.4 Browser Notifications**
| Setting | Type | Description |
|---------|------|-------------|
| Enable Push | toggle | Browser notifications |
| New Order Sound | toggle | Audio alert for orders |
| Sound File | select | Notification sound |
| Desktop Notifications | toggle | System notifications |

**5.3.5 Webhooks** (NEW)
| Column | Type | Description |
|--------|------|-------------|
| Name | text | Webhook identifier |
| URL | url | Endpoint URL |
| Events | multi-select | Triggering events |
| Secret | password | HMAC secret |
| Active | toggle | Enable/disable |
| Last Triggered | datetime | Last successful call |

---

### 5.4 Business Tab

#### Purpose

Legal and business information for invoices and compliance.

#### Sections

**5.4.1 Business Information**
| Field | Type | Validation |
|-------|------|------------|
| Legal Business Name | text | Required |
| Trading Name | text | Optional display name |
| Business Type | select | Sole Prop, LLC, Corp, etc. |
| Registration Date | date | Business start date |
| Industry | select | E-commerce, Retail, etc. |

**5.4.2 Address**
| Field | Type | Validation |
|-------|------|------------|
| Street Address | textarea | Max 200 chars |
| City | text | Required |
| State/Division | text | Required |
| Postal Code | text | Valid format |
| Country | select | Country list |
| Map Location | map | Lat/Long picker |

**5.4.3 Tax Information**
| Field | Type | Description |
|-------|------|-------------|
| VAT/Tax ID | text | Tax registration number |
| BIN Number | text | Bangladesh BIN |
| TIN Number | text | Tax Identification |
| Registration Number | text | Business registration |
| Tax Certificate | file | Upload certificate |

**5.4.4 Banking Information** (NEW)
| Field | Type | Description |
|-------|------|-------------|
| Bank Name | text | Primary bank |
| Account Name | text | Account holder |
| Account Number | text | Bank account number |
| Routing Number | text | Bank routing/branch |
| SWIFT Code | text | International transfers |
| Payment Methods | multi-select | Accepted methods |

---

### 5.5 Social Tab

#### Purpose

Social media presence and integration.

#### Sections

**5.5.1 Social Links**
| Platform | Icon | URL Format |
|----------|------|------------|
| Facebook | FB icon | facebook.com/... |
| Instagram | IG icon | instagram.com/... |
| Twitter/X | X icon | x.com/... |
| YouTube | YT icon | youtube.com/... |
| TikTok | TT icon | tiktok.com/... |
| LinkedIn | LI icon | linkedin.com/... |
| Pinterest | Pin icon | pinterest.com/... |
| WhatsApp | WA icon | wa.me/... |

**5.5.2 Social Sharing** (NEW)
| Setting | Type | Description |
|---------|------|-------------|
| Enable Social Sharing | toggle | Product share buttons |
| Platforms | checkboxes | Which platforms to show |
| Share Text Template | textarea | Default share message |
| Include Image | toggle | Share product image |

**5.5.3 Social Preview** (NEW)
Live preview of how links appear when shared:

- Facebook Card Preview
- Twitter Card Preview
- LinkedIn Preview
- Open Graph settings

---

### 5.6 Account Tab

#### Purpose

Admin user profile and account management.

#### Sections

**5.6.1 Profile Information**
| Field | Type | Description |
|-------|------|-------------|
| Avatar | file/initials | Profile picture |
| Full Name | text | Display name |
| Email | email | Account email |
| Phone | tel | Contact number |
| Job Title | text | Role description |
| Bio | textarea | Brief description |
| Language | select | Interface language |

**5.6.2 Preferences** (NEW)
| Setting | Type | Description |
|---------|------|-------------|
| Theme | select | Light, Dark, System |
| Compact Mode | toggle | Denser UI |
| Default Dashboard | select | Landing page |
| Sidebar Collapsed | toggle | Default sidebar state |
| Items Per Page | select | 10, 25, 50, 100 |

**5.6.3 Active Sessions**
| Column | Description |
|--------|-------------|
| Device | Browser + OS |
| Location | City, Country |
| IP Address | Client IP |
| Last Active | Timestamp |
| Actions | Revoke button |

---

### 5.7 Security Tab

#### Purpose

Account security, authentication, and access control.

#### Sections

**5.7.1 Change Password**
| Field | Type | Validation |
|-------|------|------------|
| Current Password | password | Required |
| New Password | password | Min 8 chars, complexity |
| Confirm Password | password | Must match |

Password strength indicator:

- Length (8+ chars)
- Uppercase letter
- Lowercase letter
- Number
- Special character

**5.7.2 Two-Factor Authentication**
| State | Actions |
|-------|---------|
| Disabled | Enable 2FA button |
| Setup | QR code, backup codes |
| Enabled | Disable, regenerate backup codes |

2FA Methods:

- Authenticator App (TOTP)
- SMS (optional)
- Email Code (backup)

**5.7.3 Login History** (NEW)
| Column | Description |
|--------|-------------|
| Date/Time | Login timestamp |
| Device | Browser + OS |
| Location | City, Country |
| IP Address | Client IP |
| Status | Success/Failed |

**5.7.4 Security Settings** (NEW)
| Setting | Type | Description |
|---------|------|-------------|
| Session Timeout | select | Auto-logout time |
| Remember Me Duration | select | Cookie lifetime |
| Login Notifications | toggle | Email on new login |
| Block After Failures | number | Failed login limit |
| Require 2FA | toggle | Mandatory for all admins |

**5.7.5 Danger Zone**
| Action | Confirmation | Description |
|--------|--------------|-------------|
| Export All Data | Password | Download all data |
| Delete All Orders | Type phrase | Clear order history |
| Delete All Products | Type phrase | Clear catalog |
| Delete Account | Type phrase + password | Remove admin account |
| Factory Reset | Type phrase + password | Complete reset |

---

### 5.8 Payment Tab (NEW)

#### Purpose

Payment gateway configuration and method management.

#### Sections

**5.8.1 Payment Methods**
| Method | Status | Settings |
|--------|--------|----------|
| Cash on Delivery | toggle | Instructions text |
| Bank Transfer | toggle | Bank details |
| bKash | toggle | Merchant number |
| Nagad | toggle | Merchant number |
| Card Payment | toggle | Gateway config |

**5.8.2 Payment Gateways**
| Gateway | Configuration |
|---------|---------------|
| SSLCommerz | Store ID, Password, Sandbox mode |
| Stripe | Publishable key, Secret key |
| PayPal | Client ID, Secret |
| bKash | App key, App secret, Username, Password |

**5.8.3 Currency Settings**
| Setting | Type | Description |
|---------|------|-------------|
| Accepted Currencies | multi-select | Checkout currencies |
| Auto Convert | toggle | Convert to base currency |
| Exchange Rate Source | select | Manual, API |

---

### 5.9 Advanced Tab (NEW)

#### Purpose

Developer tools, API access, and system configuration.

#### Sections

**5.9.1 API Keys**
| Column | Description |
|--------|-------------|
| Name | Key identifier |
| Key | Masked API key |
| Permissions | Read, Write, Admin |
| Created | Creation date |
| Last Used | Last API call |
| Actions | Regenerate, Revoke |

**5.9.2 Webhooks Management**
Full webhook configuration with:

- Event selection
- Retry settings
- Delivery logs
- Testing tools

**5.9.3 Import/Export**
| Action | Formats | Description |
|--------|---------|-------------|
| Export Products | CSV, JSON | Download catalog |
| Import Products | CSV | Bulk upload |
| Export Orders | CSV, JSON | Order history |
| Export Customers | CSV | Customer list |
| Backup Settings | JSON | Configuration backup |
| Restore Settings | JSON | Restore from backup |

**5.9.4 Cache Management**
| Action | Description |
|--------|-------------|
| Clear Page Cache | Reset cached pages |
| Clear API Cache | Reset API responses |
| Clear Image Cache | Regenerate thumbnails |
| Clear All | Full cache purge |

**5.9.5 System Information**
| Info | Description |
|------|-------------|
| App Version | Current version |
| Last Updated | Update timestamp |
| Database Size | Storage used |
| Media Storage | S3/storage usage |
| API Requests | Today's count |
| Error Rate | Recent errors % |

---

## 6. Backend Enhancements

### 6.1 Updated Settings Model

```typescript
// apps/backend/src/modules/settings/settings.model.ts

const settingsSchema = new mongoose.Schema(
  {
    // Store Information
    storeName: { type: String, default: 'Lunaz Store' },
    storeDescription: { type: String, default: '' },
    storeEmail: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },

    // Regional Settings
    currency: { type: String, default: 'BDT' },
    currencyPosition: { type: String, enum: ['before', 'after'], default: 'before' },
    decimalSeparator: { type: String, default: '.' },
    thousandsSeparator: { type: String, default: ',' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
    defaultLanguage: { type: String, default: 'en' },
    weightUnit: { type: String, enum: ['kg', 'lb', 'g', 'oz'], default: 'kg' },
    dimensionUnit: { type: String, enum: ['cm', 'in', 'm', 'ft'], default: 'cm' },

    // Features
    enableReviews: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableQuickView: { type: Boolean, default: true },
    enableCompare: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: true },
    allowRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' },

    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: [{ type: String }],
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    googleTagManagerId: { type: String, default: '' },

    // Shipping
    freeShippingThreshold: { type: Number, default: 0 },
    standardShippingRate: { type: Number, default: 0 },
    expressShippingRate: { type: Number, default: 0 },
    sameDayShippingRate: { type: Number, default: 0 },
    shippingCalculation: {
      type: String,
      enum: ['flat', 'weight', 'price', 'items'],
      default: 'flat',
    },

    // Tax
    enableTax: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    taxIncludedInPrices: { type: Boolean, default: false },
    displayTaxInCart: { type: Boolean, default: true },
    taxLabel: { type: String, default: 'Tax' },
    showTaxNumber: { type: Boolean, default: false },

    // Orders
    orderPrefix: { type: String, default: 'LN' },
    orderNumberStart: { type: Number, default: 1000 },
    autoConfirmOrders: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 10 },
    outOfStockDisplay: { type: String, enum: ['hide', 'show'], default: 'show' },
    allowBackorder: { type: Boolean, default: false },
    minimumOrderAmount: { type: Number, default: 0 },
    maximumOrderItems: { type: Number, default: 100 },

    // Business Information
    businessName: { type: String, default: '' },
    tradingName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    registrationDate: { type: Date },
    industry: { type: String, default: '' },

    // Business Address
    businessAddress: { type: String, default: '' },
    businessCity: { type: String, default: '' },
    businessState: { type: String, default: '' },
    businessPostalCode: { type: String, default: '' },
    businessCountry: { type: String, default: 'Bangladesh' },
    businessLat: { type: Number },
    businessLng: { type: Number },

    // Tax Information
    vatNumber: { type: String, default: '' },
    binNumber: { type: String, default: '' },
    tinNumber: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    taxCertificateUrl: { type: String, default: '' },

    // Banking
    bankName: { type: String, default: '' },
    bankAccountName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    bankRoutingNumber: { type: String, default: '' },
    bankSwiftCode: { type: String, default: '' },
    acceptedPaymentMethods: [{ type: String }],

    // Social Links
    socialFacebook: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    socialYoutube: { type: String, default: '' },
    socialTiktok: { type: String, default: '' },
    socialLinkedin: { type: String, default: '' },
    socialPinterest: { type: String, default: '' },
    socialWhatsapp: { type: String, default: '' },

    // Social Sharing
    enableSocialSharing: { type: Boolean, default: true },
    socialSharingPlatforms: [{ type: String }],
    socialShareTemplate: { type: String, default: '' },
    socialShareIncludeImage: { type: Boolean, default: true },

    // Notification Settings
    notifications: {
      // Admin notifications
      adminNewOrder: { type: Boolean, default: true },
      adminOrderCancelled: { type: Boolean, default: true },
      adminLowStock: { type: Boolean, default: true },
      adminOutOfStock: { type: Boolean, default: true },
      adminNewCustomer: { type: Boolean, default: false },
      adminFailedPayment: { type: Boolean, default: true },
      adminRefund: { type: Boolean, default: true },
      adminNewReview: { type: Boolean, default: false },

      // Customer notifications
      customerOrderConfirmation: { type: Boolean, default: true },
      customerOrderShipped: { type: Boolean, default: true },
      customerOrderDelivered: { type: Boolean, default: true },
      customerOrderCancelled: { type: Boolean, default: true },
      customerRefund: { type: Boolean, default: true },

      // Reports
      dailyReport: { type: Boolean, default: false },
      dailyReportTime: { type: String, default: '08:00' },
      dailyReportRecipients: [{ type: String }],
      weeklyReport: { type: Boolean, default: true },
      weeklyReportDay: { type: Number, default: 1 }, // Monday
      weeklyReportRecipients: [{ type: String }],
      monthlyReport: { type: Boolean, default: true },
      monthlyReportRecipients: [{ type: String }],

      // Browser
      enableBrowserNotifications: { type: Boolean, default: true },
      orderNotificationSound: { type: Boolean, default: true },
      notificationSoundFile: { type: String, default: 'default' },
    },

    // Payment Configuration
    payments: {
      cashOnDelivery: { type: Boolean, default: true },
      codInstructions: { type: String, default: '' },
      bankTransfer: { type: Boolean, default: true },
      bankTransferInstructions: { type: String, default: '' },
      bkash: { type: Boolean, default: false },
      bkashMerchantNumber: { type: String, default: '' },
      nagad: { type: Boolean, default: false },
      nagadMerchantNumber: { type: String, default: '' },
      cardPayment: { type: Boolean, default: false },
    },

    // Payment Gateways (encrypted in production)
    gateways: {
      sslcommerz: {
        enabled: { type: Boolean, default: false },
        storeId: { type: String, default: '' },
        storePassword: { type: String, default: '' },
        sandbox: { type: Boolean, default: true },
      },
      stripe: {
        enabled: { type: Boolean, default: false },
        publishableKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
      },
      paypal: {
        enabled: { type: Boolean, default: false },
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        sandbox: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);
```

### 6.2 New API Endpoints

```typescript
// Settings Routes
GET    /settings                    // Get all settings (admin)
PATCH  /settings                    // Update settings (admin)
GET    /settings/public             // Public settings
POST   /settings/test-email         // Test email configuration
POST   /settings/clear-cache        // Clear application cache
GET    /settings/system-info        // System information
POST   /settings/backup             // Create settings backup
POST   /settings/restore            // Restore from backup

// Shipping Zones
GET    /settings/shipping-zones     // List zones
POST   /settings/shipping-zones     // Create zone
PATCH  /settings/shipping-zones/:id // Update zone
DELETE /settings/shipping-zones/:id // Delete zone

// Tax Rules
GET    /settings/tax-rules          // List rules
POST   /settings/tax-rules          // Create rule
PATCH  /settings/tax-rules/:id      // Update rule
DELETE /settings/tax-rules/:id      // Delete rule

// Webhooks
GET    /settings/webhooks           // List webhooks
POST   /settings/webhooks           // Create webhook
PATCH  /settings/webhooks/:id       // Update webhook
DELETE /settings/webhooks/:id       // Delete webhook
POST   /settings/webhooks/:id/test  // Test webhook

// API Keys
GET    /settings/api-keys           // List API keys
POST   /settings/api-keys           // Create API key
DELETE /settings/api-keys/:id       // Revoke API key

// Sessions
GET    /users/me/sessions           // List active sessions
DELETE /users/me/sessions/:id       // Revoke session
DELETE /users/me/sessions           // Revoke all except current

// Login History
GET    /users/me/login-history      // Get login history

// 2FA
POST   /users/me/2fa/enable         // Start 2FA setup
POST   /users/me/2fa/verify         // Verify and activate
POST   /users/me/2fa/disable        // Disable 2FA
GET    /users/me/2fa/backup-codes   // Get backup codes
POST   /users/me/2fa/backup-codes   // Regenerate backup codes
```

### 6.3 New Models

```typescript
// Shipping Zone Model
const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    regions: [{ type: String }],
    methods: [
      {
        type: { type: String, enum: ['standard', 'express', 'same_day'] },
        rate: { type: Number },
        enabled: { type: Boolean, default: true },
      },
    ],
    deliveryTime: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Tax Rule Model
const taxRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String, required: true },
    rate: { type: Number, required: true },
    priority: { type: Number, default: 0 },
    compound: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Webhook Model
const webhookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: [{ type: String }],
    secret: { type: String },
    isActive: { type: Boolean, default: true },
    lastTriggered: { type: Date },
    lastStatus: { type: Number },
  },
  { timestamps: true }
);

// API Key Model
const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    keyHash: { type: String, required: true },
    permissions: [{ type: String, enum: ['read', 'write', 'admin'] }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUsed: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Session Model
const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    ip: { type: String },
    location: { type: String },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Login History Model
const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    ip: { type: String },
    location: { type: String },
    success: { type: Boolean, required: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);
```

---

## 7. Shared UI Components

### 7.1 SettingsSection

```tsx
interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'new' | 'beta' | 'deprecated';
}
```

### 7.2 SettingsField

```tsx
interface SettingsFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  horizontal?: boolean; // Label beside input
  labelWidth?: 'sm' | 'md' | 'lg'; // 1/4, 1/3, 1/2
}
```

### 7.3 SettingsToggle

```tsx
interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
```

### 7.4 Form Controls

All form controls share common props:

```tsx
interface BaseInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

Specific controls:

- **TextInput**: Basic text, email, tel, url
- **NumberInput**: With prefix, suffix, min, max, step
- **SelectInput**: Single select with options
- **MultiSelect**: Multiple selection
- **TextArea**: Multi-line with rows, maxLength
- **Toggle**: Boolean switch
- **PasswordInput**: With show/hide toggle
- **FileUpload**: Single/multiple, accept types, preview
- **ColorPicker**: Color selection with presets
- **DatePicker**: Date/datetime selection
- **TagInput**: Multiple tags/keywords

---

## 8. State Management

### 8.1 Settings Context

```tsx
interface SettingsContextValue {
  settings: StoreSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (partial: Partial<StoreSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  hasUnsavedChanges: boolean;
  saveAllChanges: () => Promise<void>;
  discardChanges: () => void;
}
```

### 8.2 Form State Hook

```tsx
function useSettingsForm<T>(initialValues: T) {
  return {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;

    setValue: (field: keyof T, value: T[keyof T]) => void;
    setValues: (values: Partial<T>) => void;
    setError: (field: keyof T, error: string) => void;
    setTouched: (field: keyof T) => void;

    handleSubmit: (onSubmit: (values: T) => Promise<void>) => void;
    reset: () => void;
    resetField: (field: keyof T) => void;
  };
}
```

### 8.3 Unsaved Changes Warning

```tsx
function useUnsavedChanges(isDirty: boolean) {
  // Warns user before leaving page with unsaved changes
  // Shows confirmation dialog
  // Integrates with React Router
}
```

---

## 9. API Integration

### 9.1 API Client

```typescript
// apps/manage/src/features/settings/api/settings.api.ts

export const settingsApi = {
  // Core settings
  getSettings: () => api<StoreSettings>('/settings'),
  updateSettings: (data: Partial<StoreSettings>) =>
    api<StoreSettings>('/settings', { method: 'PATCH', body: data }),

  // Shipping zones
  getShippingZones: () => api<ShippingZone[]>('/settings/shipping-zones'),
  createShippingZone: (data: CreateShippingZone) =>
    api<ShippingZone>('/settings/shipping-zones', { method: 'POST', body: data }),
  updateShippingZone: (id: string, data: Partial<ShippingZone>) =>
    api<ShippingZone>(`/settings/shipping-zones/${id}`, { method: 'PATCH', body: data }),
  deleteShippingZone: (id: string) => api(`/settings/shipping-zones/${id}`, { method: 'DELETE' }),

  // Tax rules
  getTaxRules: () => api<TaxRule[]>('/settings/tax-rules'),
  createTaxRule: (data: CreateTaxRule) =>
    api<TaxRule>('/settings/tax-rules', { method: 'POST', body: data }),
  updateTaxRule: (id: string, data: Partial<TaxRule>) =>
    api<TaxRule>(`/settings/tax-rules/${id}`, { method: 'PATCH', body: data }),
  deleteTaxRule: (id: string) => api(`/settings/tax-rules/${id}`, { method: 'DELETE' }),

  // Webhooks
  getWebhooks: () => api<Webhook[]>('/settings/webhooks'),
  createWebhook: (data: CreateWebhook) =>
    api<Webhook>('/settings/webhooks', { method: 'POST', body: data }),
  updateWebhook: (id: string, data: Partial<Webhook>) =>
    api<Webhook>(`/settings/webhooks/${id}`, { method: 'PATCH', body: data }),
  deleteWebhook: (id: string) => api(`/settings/webhooks/${id}`, { method: 'DELETE' }),
  testWebhook: (id: string) => api(`/settings/webhooks/${id}/test`, { method: 'POST' }),

  // API Keys
  getApiKeys: () => api<ApiKey[]>('/settings/api-keys'),
  createApiKey: (data: CreateApiKey) =>
    api<ApiKeyWithSecret>('/settings/api-keys', { method: 'POST', body: data }),
  revokeApiKey: (id: string) => api(`/settings/api-keys/${id}`, { method: 'DELETE' }),

  // System
  testEmail: (email: string) => api('/settings/test-email', { method: 'POST', body: { email } }),
  clearCache: (type?: 'all' | 'page' | 'api' | 'image') =>
    api('/settings/clear-cache', { method: 'POST', body: { type } }),
  getSystemInfo: () => api<SystemInfo>('/settings/system-info'),
  exportSettings: () => api<Blob>('/settings/backup'),
  importSettings: (data: File) => {
    const formData = new FormData();
    formData.append('file', data);
    return api('/settings/restore', { method: 'POST', body: formData });
  },
};
```

### 9.2 User API Extensions

```typescript
export const userApi = {
  // Profile
  updateProfile: (data: UpdateProfile) => api('/users/me', { method: 'PATCH', body: data }),
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api('/users/me/avatar', { method: 'PUT', body: formData });
  },
  removeAvatar: () => api('/users/me/avatar', { method: 'DELETE' }),

  // Password
  changePassword: (data: ChangePassword) =>
    api('/users/me/password', { method: 'PUT', body: data }),

  // Sessions
  getSessions: () => api<Session[]>('/users/me/sessions'),
  revokeSession: (id: string) => api(`/users/me/sessions/${id}`, { method: 'DELETE' }),
  revokeAllSessions: () => api('/users/me/sessions', { method: 'DELETE' }),

  // Login History
  getLoginHistory: (params?: { limit?: number }) =>
    api<LoginHistory[]>('/users/me/login-history', { params }),

  // 2FA
  enable2FA: () => api<TwoFactorSetup>('/users/me/2fa/enable', { method: 'POST' }),
  verify2FA: (code: string) => api('/users/me/2fa/verify', { method: 'POST', body: { code } }),
  disable2FA: (code: string) => api('/users/me/2fa/disable', { method: 'POST', body: { code } }),
  getBackupCodes: () => api<string[]>('/users/me/2fa/backup-codes'),
  regenerateBackupCodes: (code: string) =>
    api<string[]>('/users/me/2fa/backup-codes', { method: 'POST', body: { code } }),

  // Danger Zone
  exportData: () => api<Blob>('/users/me/export'),
  deleteAccount: (data: DeleteAccount) => api('/users/me', { method: 'DELETE', body: data }),
};
```

---

## 10. Validation & Error Handling

### 10.1 Validation Schema (Zod)

```typescript
// Store Settings
export const storeSettingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required').max(100),
  storeDescription: z.string().max(500).optional(),
  storeEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]+$/, 'Invalid phone')
    .optional()
    .or(z.literal('')),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
});

// Shipping Settings
export const shippingSettingsSchema = z.object({
  freeShippingThreshold: z.number().min(0, 'Must be 0 or greater'),
  standardShippingRate: z.number().min(0, 'Must be 0 or greater'),
  expressShippingRate: z.number().min(0, 'Must be 0 or greater'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be 0-100%'),
  orderPrefix: z.string().min(1).max(10),
  lowStockThreshold: z.number().int().min(0),
});

// Business Info
export const businessInfoSchema = z.object({
  businessName: z.string().max(200).optional(),
  businessAddress: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).optional(),
  vatNumber: z.string().max(50).optional(),
  registrationNumber: z.string().max(50).optional(),
});

// Password Change
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Social Links
export const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});
```

### 10.2 Error Handling

```typescript
// Centralized error handler
export function handleSettingsError(error: unknown, toast: ToastFn) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        toast(error.message || 'Invalid data', 'error');
        break;
      case 401:
        toast('Session expired. Please login again.', 'error');
        // Redirect to login
        break;
      case 403:
        toast('You do not have permission to change these settings', 'error');
        break;
      case 422:
        // Validation errors - handled by form
        break;
      case 500:
        toast('Server error. Please try again later.', 'error');
        break;
      default:
        toast('Something went wrong', 'error');
    }
  } else {
    toast('Network error. Please check your connection.', 'error');
  }
}
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Core Infrastructure)

**Duration:** ~2-3 days

1. **Create directory structure**
   - Set up folder hierarchy
   - Create index files for exports

2. **Build shared components**
   - SettingsLayout, SettingsTabs, SettingsContent
   - SettingsSection, SettingsField, SettingsDivider
   - Form controls (TextInput, SelectInput, Toggle, etc.)

3. **Set up contexts and hooks**
   - SettingsContext
   - useSettingsForm hook
   - useUnsavedChanges hook

4. **Create types and constants**
   - All TypeScript interfaces
   - Options arrays (currencies, timezones, etc.)
   - Default values

### Phase 2: Core Tabs (Main Functionality)

**Duration:** ~3-4 days

1. **General Tab**
   - Store Information section
   - Regional Settings section
   - Features section
   - Full backend integration

2. **Shipping & Tax Tab**
   - Shipping Rates section
   - Tax Settings section
   - Order Settings section
   - Backend integration

3. **Account Tab**
   - Profile section with avatar
   - Sessions management
   - Preferences

4. **Security Tab**
   - Password change
   - Login history
   - Danger zone with confirmations

### Phase 3: Extended Tabs (Additional Features)

**Duration:** ~3-4 days

1. **Notifications Tab**
   - Email notifications
   - Report scheduling
   - Browser notifications

2. **Business Tab**
   - Business information
   - Address with country
   - Tax documents

3. **Social Tab**
   - Social links
   - Social sharing config
   - Preview cards

### Phase 4: New Features (Enhancements)

**Duration:** ~3-4 days

1. **Payment Tab**
   - Payment methods
   - Gateway configuration
   - Currency settings

2. **Advanced Tab**
   - API keys management
   - Webhooks management
   - Import/Export
   - Cache management
   - System info

### Phase 5: Backend Enhancements

**Duration:** ~4-5 days

1. **Extended Settings Model**
   - All new fields
   - Validation schemas

2. **New Endpoints**
   - Shipping zones CRUD
   - Tax rules CRUD
   - Webhooks CRUD
   - API keys CRUD
   - Sessions & login history
   - 2FA endpoints

3. **New Models**
   - ShippingZone
   - TaxRule
   - Webhook
   - ApiKey
   - Session
   - LoginHistory

### Phase 6: Polish & Testing

**Duration:** ~2-3 days

1. **UI Polish**
   - Animations and transitions
   - Loading states
   - Empty states
   - Error states

2. **Testing**
   - Component testing
   - Integration testing
   - E2E testing for critical flows

3. **Documentation**
   - Component documentation
   - API documentation
   - User guide

---

## 12. File Structure

### 12.1 Final Directory Tree

```
apps/manage/src/features/settings/
├── index.ts
├── SettingsPage.tsx
├── components/
│   ├── layout/
│   │   ├── index.ts
│   │   ├── SettingsLayout.tsx
│   │   ├── SettingsTabs.tsx
│   │   ├── SettingsHeader.tsx
│   │   └── SettingsContent.tsx
│   ├── shared/
│   │   ├── index.ts
│   │   ├── SettingsSection.tsx
│   │   ├── SettingsField.tsx
│   │   ├── SettingsToggle.tsx
│   │   ├── SettingsDivider.tsx
│   │   ├── SettingsSaveButton.tsx
│   │   ├── SettingsCard.tsx
│   │   └── SettingsAlert.tsx
│   ├── form/
│   │   ├── index.ts
│   │   ├── TextInput.tsx
│   │   ├── NumberInput.tsx
│   │   ├── SelectInput.tsx
│   │   ├── TextArea.tsx
│   │   ├── Toggle.tsx
│   │   ├── FileUpload.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── TagInput.tsx
│   │   └── ColorPicker.tsx
│   └── tabs/
│       ├── GeneralTab/
│       ├── ShippingTab/
│       ├── NotificationsTab/
│       ├── BusinessTab/
│       ├── SocialTab/
│       ├── AccountTab/
│       ├── SecurityTab/
│       ├── PaymentTab/
│       └── AdvancedTab/
├── hooks/
│   ├── index.ts
│   ├── useSettings.ts
│   ├── useSettingsForm.ts
│   ├── useUnsavedChanges.ts
│   └── useSettingsValidation.ts
├── context/
│   ├── index.ts
│   ├── SettingsContext.tsx
│   └── SettingsFormContext.tsx
├── types/
│   ├── index.ts
│   ├── settings.types.ts
│   ├── tabs.types.ts
│   └── form.types.ts
├── utils/
│   ├── index.ts
│   ├── validators.ts
│   ├── formatters.ts
│   ├── constants.ts
│   └── defaults.ts
└── api/
    ├── index.ts
    ├── settings.api.ts
    └── types.ts
```

### 12.2 Backend Changes

```
apps/backend/src/modules/settings/
├── settings.model.ts          # Extended with all fields
├── settings.routes.ts         # Extended with new endpoints
├── settings.service.ts        # NEW: Business logic
├── settings.validation.ts     # Extended schemas
├── shipping-zones.model.ts    # NEW
├── shipping-zones.routes.ts   # NEW
├── tax-rules.model.ts         # NEW
├── tax-rules.routes.ts        # NEW
├── webhooks.model.ts          # NEW
├── webhooks.routes.ts         # NEW
├── webhooks.service.ts        # NEW: Webhook dispatch
├── api-keys.model.ts          # NEW
└── api-keys.routes.ts         # NEW

apps/backend/src/modules/users/
├── users.model.ts             # Extended for 2FA
├── users.routes.ts            # Extended with new endpoints
├── users.service.ts           # Extended
├── sessions.model.ts          # NEW
├── sessions.routes.ts         # NEW
├── login-history.model.ts     # NEW
└── two-factor.service.ts      # NEW: 2FA logic
```

---

## Summary

This specification outlines a comprehensive refactoring of the Settings Page from a monolithic 1009-line component into a modular, maintainable, and fully functional system. The implementation includes:

- **9 Settings Tabs** (7 existing + 2 new)
- **40+ Reusable Components**
- **15+ New Backend Endpoints**
- **6 New Database Models**
- **Complete Type Safety**
- **Full Validation**
- **Professional UI/UX**

The phased approach ensures incremental delivery with working features at each stage.
