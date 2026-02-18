import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ManageAuthGuard } from './features/manage/components/ManageAuthGuard';
import { ManageLayout } from './features/manage/components/ManageLayout';
import { LoginPage as ManageLoginPage } from './features/manage/auth/LoginPage';
import { DashboardPage } from './features/manage/dashboard/DashboardPage';
import { ProductsPage as ManageProductsPage } from './features/manage/products/ProductsPage';
import { ProductFormPage } from './features/manage/products/ProductFormPage';
import { CategoriesPage as ManageCategoriesPage } from './features/manage/categories/CategoriesPage';
import { CategoryFormPage } from './features/manage/categories/CategoryFormPage';
import { OrdersPage as ManageOrdersPage } from './features/manage/orders/OrdersPage';
import { OrderDetailPage as ManageOrderDetailPage } from './features/manage/orders/OrderDetailPage';
import { CustomersPage } from './features/manage/customers/CustomersPage';
import { CustomerDetailPage } from './features/manage/customers/CustomerDetailPage';
import { TransactionsPage } from './features/manage/reports/TransactionsPage';
import { TransactionDetailPage } from './features/manage/reports/TransactionDetailPage';
import { ReportsPage } from './features/manage/reports/ReportsPage';
import { SettingsPage } from './features/manage/settings/SettingsPage';
import { AnalyticsPage } from './features/manage/analytics/AnalyticsPage';
import { SpeedInsightsPage } from './features/manage/analytics/SpeedInsightsPage';
import { ServerLogsPage } from './features/manage/analytics/ServerLogsPage';
import { TrafficLogsPage } from './features/manage/analytics/TrafficLogsPage';
import {
  ComplianceDashboard,
  IncomeTaxPage,
  BusinessAuthenticityPage,
  CertificatesPage,
  LegalDocumentsPage,
} from './features/manage/compliance';
import { HomePage } from './features/home/HomePage';
import { ProductsPage } from './features/products/ProductsPage';
import { ProductDetailPage } from './features/products/ProductDetailPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { CategoryPage } from './features/categories/CategoryPage';
import { SearchPage } from './features/search/SearchPage';
import { CartPage } from './features/cart/CartPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { GoogleCallbackPage } from './features/auth/GoogleCallbackPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { CheckoutSuccessPage } from './features/checkout/CheckoutSuccessPage';
import { CheckoutFailedPage } from './features/checkout/CheckoutFailedPage';
import { CheckoutCancelledPage } from './features/checkout/CheckoutCancelledPage';
import { CheckoutErrorPage } from './features/checkout/CheckoutErrorPage';
import { AccountLayout } from './features/account/AccountLayout';
import { ProfilePage } from './features/account/ProfilePage';
import { AddressesPage } from './features/account/AddressesPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';

function App() {
  return (
    <Routes>
      {/* Admin / Manage routes — nested under /manage */}
      <Route
        path="/manage"
        element={
          <AdminAuthProvider>
            <Outlet />
          </AdminAuthProvider>
        }
      >
        <Route path="login" element={<ManageLoginPage />} />
        <Route
          element={
            <ManageAuthGuard>
              <ManageLayout />
            </ManageAuthGuard>
          }
        >
          <Route index element={<Navigate to="/manage/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ManageProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<ManageCategoriesPage />} />
          <Route path="categories/new" element={<CategoryFormPage />} />
          <Route path="categories/:id" element={<CategoryFormPage />} />
          <Route path="orders" element={<ManageOrdersPage />} />
          <Route path="orders/:id" element={<ManageOrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="speed-insights" element={<SpeedInsightsPage />} />
          <Route path="traffic-logs" element={<TrafficLogsPage />} />
          <Route path="server-logs" element={<ServerLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="compliance/dashboard" element={<ComplianceDashboard />} />
          <Route path="compliance/income-tax" element={<IncomeTaxPage />} />
          <Route path="compliance/authenticity" element={<BusinessAuthenticityPage />} />
          <Route path="compliance/certificates" element={<CertificatesPage />} />
          <Route path="compliance/documents" element={<LegalDocumentsPage />} />
          <Route path="*" element={<Navigate to="/manage/dashboard" replace />} />
        </Route>
      </Route>

      {/* Customer routes — with storefront Layout */}
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Checkout routes */}
        <Route
          path="/checkout"
          element={
            <AuthGuard>
              <CheckoutPage />
            </AuthGuard>
          }
        />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/failed" element={<CheckoutFailedPage />} />
        <Route path="/checkout/cancelled" element={<CheckoutCancelledPage />} />
        <Route path="/checkout/error" element={<CheckoutErrorPage />} />

        {/* Protected routes */}
        <Route
          path="/account"
          element={
            <AuthGuard>
              <AccountLayout />
            </AuthGuard>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>
      {/* Catch-all: redirect unknown paths to home (or 404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
