import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { Container, Button } from '@/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Footer } from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

function SearchBar({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 focus:bg-white transition-colors placeholder:text-slate-400"
      />
    </form>
  );
}

function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link
      to="/cart"
      className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
      aria-label="Cart"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-slate-900 text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign in
        </Link>
        <Link to="/register">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white px-4">
            Register
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
      >
        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-slate-600">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                to="/account"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Account
              </Link>
              <Link
                to="/account/orders"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Orders
              </Link>
              <Link
                to="/account/addresses"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Addresses
              </Link>
            </div>
            <div className="border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                  navigate('/');
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <span className="font-serif text-xl font-medium text-slate-900">Menu</span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isAuthenticated && (
            <div className="mb-6 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </Link>
            <Link
              to="/categories"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Categories
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              All Products
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Cart
            </Link>
          </nav>

          <hr className="my-4 border-slate-100" />

          {isAuthenticated ? (
            <nav className="space-y-1">
              <Link
                to="/account"
                className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Account
              </Link>
              <Link
                to="/account/orders"
                className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                  navigate('/');
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </nav>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="block w-full px-4 py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                onClick={onClose}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block w-full px-4 py-2.5 text-center text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80">
        <Container>
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link
              to="/"
              className="font-serif text-2xl font-medium text-slate-900 tracking-tight flex-shrink-0"
            >
              Lunaz
            </Link>

            {/* Search Bar - visible on medium screens and up */}
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/categories"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Categories
              </Link>
              <Link
                to="/products"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Products
              </Link>
            </nav>

            {/* Cart & User */}
            <div className="flex items-center gap-1">
              <CartIcon />
              <div className="hidden md:block ml-2">
                <UserMenu />
              </div>
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </Container>
      </header>

      <main className="flex-1">{children ?? <Outlet />}</main>

      <Footer />

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  );
}
