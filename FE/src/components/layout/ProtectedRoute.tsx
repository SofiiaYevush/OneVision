import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import type { UserRole } from '@/types/api';

interface Props {
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/auth" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return <Outlet />;
}