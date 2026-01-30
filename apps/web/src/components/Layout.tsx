import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button } from '@lunaz/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface LayoutProps {
  children: React.ReactNode;
}

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-48 md:w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link to="/cart" className="relative text-gray-600 hover:text-gray-900" aria-label="Cart">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-600 hover:text-gray-900">
          Login
        </Link>
        <Link to="/register">
          <Button size="sm">Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <span className="text-sm font-medium">{user?.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
              <Link
                to="/account/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>
              <Link
                to="/account/addresses"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Addresses
              </Link>
              <hr className="my-1" />
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                  navigate('/');
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="mt-8 space-y-4">
            <Link to="/" className="block text-gray-900 font-medium" onClick={onClose}>
              Home
            </Link>
            <Link to="/categories" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
              Categories
            </Link>
            <Link to="/products" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
              All Products
            </Link>
            <Link to="/cart" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
              Cart
            </Link>
            <hr />
            {isAuthenticated ? (
              <>
                <Link to="/account" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
                  My Account
                </Link>
                <Link to="/account/orders" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
                  Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                    navigate('/');
                  }}
                  className="block text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
                  Login
                </Link>
                <Link to="/register" className="block text-gray-600 hover:text-gray-900" onClick={onClose}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-semibold text-gray-900">
              Lunaz
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/categories" className="text-gray-600 hover:text-gray-900">
                Categories
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
            </nav>

            {/* Search, Cart, User */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <SearchBar />
              </div>
              <CartIcon />
              <div className="hidden md:block">
                <UserMenu />
              </div>
              {/* Mobile menu button */}
              <button
                className="md:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <SearchBar />
          </div>
        </Container>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-white py-8 mt-auto">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Lunaz</h3>
              <p className="text-sm text-gray-600">
                Lifestyle & Home Décor — curated products for modern living.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/categories" className="text-gray-600 hover:text-gray-900">Categories</Link></li>
                <li><Link to="/products" className="text-gray-600 hover:text-gray-900">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/account" className="text-gray-600 hover:text-gray-900">My Account</Link></li>
                <li><Link to="/account/orders" className="text-gray-600 hover:text-gray-900">Orders</Link></li>
                <li><Link to="/cart" className="text-gray-600 hover:text-gray-900">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:hello@lunaz.store" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Lunaz — Lifestyle & Home Décor. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  );
}
