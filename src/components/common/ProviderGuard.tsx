import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** يحمي لوحة تحكم المزود: لا يصلها إلا مزود معتمد (معرض أو مصمم) */
export const ProviderGuard = ({ children }: { children: ReactNode }) => {
  const { isProvider, isAdmin, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#786C65]">
        جارٍ التحقق من الصلاحيات…
      </div>
    );
  }

  // إذا كان آدمن فقط، نوجهه للوحة الآدمن
  if (isAdmin && !isProvider) {
    return <Navigate to="/admin" replace />;
  }

  // إذا كان عميلاً (customer) أو زائراً غير مسجل أو ليس مزوداً، نوجهه فوراً للصفحة الرئيسية
  if (!isProvider || !profile || profile.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
