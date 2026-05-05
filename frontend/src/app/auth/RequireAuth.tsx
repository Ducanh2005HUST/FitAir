import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, isBootstrapping } = useAuth();
  if (isBootstrapping) return null;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

