import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductsPage } from './features/products/ProductsPage';
import { ProductFormPage } from './features/products/ProductFormPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { CategoryFormPage } from './features/categories/CategoryFormPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { CustomerDetailPage } from './features/customers/CustomerDetailPage';
import { TransactionsPage } from './features/reports/TransactionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { SpeedInsightsPage } from './features/analytics/SpeedInsightsPage';
import { ServerLogsPage } from './features/analytics/ServerLogsPage';
import { TrafficLogsPage } from './features/analytics/TrafficLogsPage';
import {
  ComplianceDashboard,
  IncomeTaxPage,
  BusinessAuthenticityPage,
  CertificatesPage,
  LegalDocumentsPage,
} from './features/compliance';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryFormPage />} />
        <Route path="categories/:id" element={<CategoryFormPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
