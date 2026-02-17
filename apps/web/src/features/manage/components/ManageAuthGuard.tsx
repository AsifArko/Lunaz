import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function ManageAuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/manage/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
