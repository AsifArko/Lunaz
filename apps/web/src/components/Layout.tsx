import { Outlet } from 'react-router-dom';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
