import { Outlet, NavLink } from 'react-router-dom';
import { Container } from '@lunaz/ui';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-lg transition-colors ${
    isActive
      ? 'bg-indigo-50 text-indigo-700 font-medium'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`;

export function AccountLayout() {
  return (
    <div className="py-8">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-56 shrink-0">
            <nav className="space-y-1 bg-white rounded-lg border border-gray-200 p-2">
              <NavLink to="/account" end className={navLinkClass}>
                Profile
              </NavLink>
              <NavLink to="/account/addresses" className={navLinkClass}>
                Addresses
              </NavLink>
              <NavLink to="/account/orders" className={navLinkClass}>
                Orders
              </NavLink>
            </nav>
          </aside>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </Container>
    </div>
  );
}
