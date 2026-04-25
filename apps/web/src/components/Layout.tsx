import { Outlet } from 'react-router-dom';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { useAuth } from '../context/AuthContext';
import { SetPhoneModal } from '../features/auth/SetPhoneModal';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { requiresPhone, clearRequiresPhone } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
      <SetPhoneModal isOpen={requiresPhone} onClose={clearRequiresPhone} />
    </div>
  );
}
