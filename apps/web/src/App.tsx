import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
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
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
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
      </Routes>
    </Layout>
  );
}

export default App;
