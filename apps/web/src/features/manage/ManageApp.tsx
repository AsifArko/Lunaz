import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { ManageLayout } from './components/ManageLayout';
import { ManageAuthGuard } from './components/ManageAuthGuard';
import { LoginPage } from './auth/LoginPage';
import { DashboardPage } from './dashboard/DashboardPage';
import { ProductsPage } from './products/ProductsPage';
import { ProductFormPage } from './products/ProductFormPage';
import { CategoriesPage } from './categories/CategoriesPage';
import { CategoryFormPage } from './categories/CategoryFormPage';
import { OrdersPage } from './orders/OrdersPage';
import { OrderDetailPage } from './orders/OrderDetailPage';
import { CustomersPage } from './customers/CustomersPage';
import { CustomerDetailPage } from './customers/CustomerDetailPage';
import { TransactionsPage } from './reports/TransactionsPage';
import { ReportsPage } from './reports/ReportsPage';
import { SettingsPage } from './settings/SettingsPage';
import { AnalyticsPage } from './analytics/AnalyticsPage';
import { SpeedInsightsPage } from './analytics/SpeedInsightsPage';
import { ServerLogsPage } from './analytics/ServerLogsPage';
import { TrafficLogsPage } from './analytics/TrafficLogsPage';
import {
  ComplianceDashboard,
  IncomeTaxPage,
  BusinessAuthenticityPage,
  CertificatesPage,
  LegalDocumentsPage,
} from './compliance';

export function ManageApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/manage/login" element={<LoginPage />} />
        <Route
          path="/manage"
          element={
            <ManageAuthGuard>
              <ManageLayout />
            </ManageAuthGuard>
          }
        >
          <Route index element={<Navigate to="/manage/dashboard" replace />} />
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
          <Route path="*" element={<Navigate to="/manage/dashboard" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
