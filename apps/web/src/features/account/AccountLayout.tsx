import { Outlet, NavLink } from 'react-router-dom';
import { Container } from '@lunaz/ui';
import { useAuth } from '../../context/AuthContext';

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
);

const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  end?: boolean;
}

function NavItem({ to, icon, label, description, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gray-100 border border-gray-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`mt-0.5 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}
          >
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <span
              className={`block text-sm font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}
            >
              {label}
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}

export function AccountLayout() {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Container>
        <div className="py-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 lg:mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {user?.name || 'My Account'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <nav className="space-y-1">
                <NavItem
                  to="/account"
                  end
                  icon={<UserIcon />}
                  label="Profile"
                  description="Personal information & password"
                />
                <NavItem
                  to="/account/addresses"
                  icon={<MapPinIcon />}
                  label="Addresses"
                  description="Shipping & billing addresses"
                />
                <NavItem
                  to="/account/orders"
                  icon={<PackageIcon />}
                  label="Orders"
                  description="Track & manage your orders"
                />
              </nav>

              {/* Account Security Notice */}
              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">
                    <ShieldIcon />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Account Security</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Your data is encrypted and securely stored. We never share your information.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </Container>
    </div>
  );
}
