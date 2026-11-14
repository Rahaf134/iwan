import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** يحمي لوحة التحكم: لا يصلها إلا حساب المديرة السري */
export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        جارٍ التحقق من الصلاحيات…
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};
