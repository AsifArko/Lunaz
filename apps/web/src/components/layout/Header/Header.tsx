import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button } from '@/ui';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

function SearchBar({ className = '', compact = false }: { className?: string; compact?: boolean }) {
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
      <div
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 ${
          compact ? 'sm:left-3' : ''
        }`}
      >
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
        className={`w-full pl-9 pr-4 bg-stone-50/90 border border-stone-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300/50 focus:border-stone-300 focus:bg-white transition-all duration-300 placeholder:text-stone-400 ${
          compact ? 'py-2 text-sm' : 'py-2.5 text-sm'
        }`}
      />
    </form>
  );
}

function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] lg:min-w-[44px] lg:min-h-[44px]"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      <svg
        className="w-5 h-5 sm:w-[22px] sm:h-[22px] lg:w-5 lg:h-5"
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
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 bg-stone-800 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
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
          className="hidden sm:block px-3 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors duration-300 rounded-xl"
        >
          Sign in
        </Link>
        <Link to="/register" className="hidden sm:block">
          <Button
            size="sm"
            className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 text-sm rounded-full transition-all duration-300"
          >
            Register
          </Button>
        </Link>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || user?.name;

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all duration-300 min-h-[40px] sm:min-h-[44px] outline-none ring-0 focus:outline-none focus:ring-0 active:outline-none active:ring-0"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-stone-600">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium hidden lg:block">{firstName}</span>
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
              <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                to="/account"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-stone-400 flex-shrink-0"
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
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-stone-400 flex-shrink-0"
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
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 text-stone-400 flex-shrink-0"
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
            <div className="border-t border-stone-100">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                  navigate('/');
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-[320px] sm:max-w-[360px] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
            <span className="font-serif text-lg sm:text-xl font-medium text-stone-900">Menu</span>
            <button
              onClick={onClose}
              className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
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

          <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {isAuthenticated && (
              <div className="mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-stone-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-0.5">
              {[
                {
                  to: '/',
                  label: 'Home',
                  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                },
                {
                  to: '/categories',
                  label: 'Categories',
                  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
                },
                {
                  to: '/products',
                  label: 'All Products',
                  icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                },
                { to: '/cart', label: 'Cart', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-all duration-300 min-h-[48px]"
                  onClick={onClose}
                >
                  <svg
                    className="w-5 h-5 text-stone-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>

            <hr className="my-4 border-stone-200" />

            {isAuthenticated ? (
              <nav className="space-y-0.5">
                <Link
                  to="/account"
                  className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors duration-300 min-h-[48px]"
                  onClick={onClose}
                >
                  <svg
                    className="w-5 h-5 text-stone-400 flex-shrink-0"
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
                  className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors duration-300 min-h-[48px]"
                  onClick={onClose}
                >
                  <svg
                    className="w-5 h-5 text-stone-400 flex-shrink-0"
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
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300 min-h-[48px]"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3.5 text-center text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all duration-300"
                  onClick={onClose}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-3.5 text-center text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-all duration-300"
                  onClick={onClose}
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <Container>
          {/* Main row — responsive layout */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 min-h-[56px] sm:min-h-[60px] lg:min-h-[64px]">
            {/* Logo */}
            <Link
              to="/"
              className="font-serif text-lg sm:text-xl lg:text-2xl font-medium text-stone-900 tracking-tight flex-shrink-0"
            >
              Lunaz
            </Link>

            {/* Search — hidden on mobile, visible sm+ — wider on desktop */}
            <div className="hidden sm:flex flex-1 max-w-[320px] md:max-w-[420px] lg:max-w-[520px] xl:max-w-[600px] mx-4 lg:mx-6">
              <SearchBar compact />
            </div>

            {/* Spacer for desktop */}
            <div className="hidden lg:flex flex-1" />

            {/* Nav — hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/categories"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all duration-300"
              >
                Categories
              </Link>
              <Link
                to="/products"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all duration-300"
              >
                Products
              </Link>
            </nav>

            {/* Right: Cart + User + Hamburger */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <CartIcon />
              <UserMenu />
              <button
                className="sm:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
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

          {/* Mobile search — full width below main row */}
          <div className="sm:hidden pb-3 -mt-1">
            <SearchBar compact />
          </div>
        </Container>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
