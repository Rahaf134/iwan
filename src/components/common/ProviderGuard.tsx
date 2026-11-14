import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** يحمي لوحة تحكم المزود: لا يصلها إلا مزود معتمد */
export const ProviderGuard = ({ children }: { children: ReactNode }) => {
  const { isProvider, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#786C65]">
        جارٍ التحقق من الصلاحيات…
      </div>
    );
  }

  // إذا كان آدمن، نوجهه للوحة الآدمن
  if (isAdmin && !isProvider) {
    return <Navigate to="/admin" replace />;
  }

  // إذا لم يكن مزوداً، نوجهه لصفحة الدخول
  if (!isProvider) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
