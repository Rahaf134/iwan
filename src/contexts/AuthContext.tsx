import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/db/supabase';

export type UserRole = 'customer' | 'merchant' | 'designer';

export interface EwanProfile {
  id?: string;
  fullName: string;
  email: string;
  role: UserRole | 'admin';
  phone?: string;
  businessName?: string;
  specialty?: string;
  address?: string;
  whatsapp?: string;
  years?: string;
  bio?: string;
  logo?: string;
  storeId?: string;
  designerId?: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'merchant' | 'designer';
  storeId?: string;
  designerId?: string;
  businessName: string;
  badge: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    name: 'رحاف — مديرة المنصة',
    email: 'rahaf@gmail.com',
    password: 'rahaf1234',
    role: 'admin',
    businessName: 'إدارة منصة إيوان',
    badge: 'مديرة المنصة (إشراف كامل)',
  },
  {
    id: 'demo-reem',
    name: 'م. ريم الكثيري',
    email: 'reem@ewan.com',
    password: '123456',
    role: 'designer',
    designerId: '285c6c4b-8816-47b3-b68c-2e6de07df5ef',
    businessName: 'استوديو م. ريم الكثيري للتصميم الداخلي',
    badge: 'مصممة ديكور معتمدة',
  },
  {
    id: 'demo-altaweel',
    name: 'معرض الطويل للأثاث',
    email: 'altaweel@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    businessName: 'معرض الطويل للأثاث — فوة',
    badge: 'مزود معتمد (معرض أثاث)',
  },
  {
    id: 'demo-homecentre',
    name: 'معرض هوم سنتر (Home Centre)',
    email: 'homecentre@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    businessName: 'معرض هوم سنتر — الديس',
    badge: 'مزود معتمد (معرض أثاث)',
  },
  {
    id: 'demo-ard',
    name: 'معرض أرض حمير للأثاث والمطابخ',
    email: 'ard@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    businessName: 'معرض أرض حمير للأثاث والمطابخ — الديس',
    badge: 'مزود معتمد (معرض أثاث)',
  },
];

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  specialty?: string;
  address?: string;
  whatsapp?: string;
  years?: string;
  bio?: string;
  logo?: string;
}

interface AuthContextType {
  user: User | null;
  profile: EwanProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; admin?: boolean; provider?: boolean }>;
  quickLogin: (account: DemoAccount) => void;
  signUp: (input: SignUpInput) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'rahaf@gmail.com';
const ADMIN_PASSWORD = 'rahaf1234';
const ADMIN_SESSION_KEY = 'ewan_v4_admin_session';
const DEMO_SESSION_KEY = 'ewan_v4_demo_session';

const ADMIN_PROFILE: EwanProfile = {
  id: 'admin-rahaf',
  fullName: 'رحاف — مديرة المنصة',
  email: ADMIN_EMAIL,
  role: 'admin',
};

const normalizeEmail = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : `${trimmed}@ewan.ye`;
};

const readAdminSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const writeAdminSession = (active: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    if (active) window.localStorage.setItem(ADMIN_SESSION_KEY, '1');
    else window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // التخزين غير متاح — الجلسة تبقى في الذاكرة فقط
  }
};

const readDemoSession = (): DemoAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoAccount;
  } catch {
    return null;
  }
};

const writeDemoSession = (account: DemoAccount | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (account) window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(account));
    else window.localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // التخزين غير متاح
  }
};

const toProfile = (user: User | null): EwanProfile | null => {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = (meta.role as UserRole) ?? 'customer';
  return {
    id: user.id,
    fullName: (meta.full_name as string) ?? user.email?.split('@')[0] ?? 'عميل إيوان',
    email: user.email ?? '',
    role: ['customer', 'merchant', 'designer'].includes(role) ? role : 'customer',
    phone: (meta.phone as string) ?? undefined,
    businessName: (meta.business_name as string) ?? undefined,
    specialty: (meta.specialty as string) ?? undefined,
    address: (meta.address as string) ?? undefined,
    whatsapp: (meta.whatsapp as string) ?? undefined,
    years: (meta.years as string) ?? undefined,
    bio: (meta.bio as string) ?? undefined,
    logo: (meta.logo as string) ?? undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<boolean>(() => readAdminSession());
  const [demoSession, setDemoSession] = useState<DemoAccount | null>(() => readDemoSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const quickLogin = (account: DemoAccount) => {
    setDemoSession(account);
    writeDemoSession(account);
    if (account.role === 'admin') {
      setAdminSession(true);
      writeAdminSession(true);
    } else {
      setAdminSession(false);
      writeAdminSession(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const normalized = normalizeEmail(email);

    // 1. التحقق من الحسابات التجريبية المعتمدة
    const matchedDemo = DEMO_ACCOUNTS.find(
      (acc) => normalizeEmail(acc.email) === normalized && acc.password === password,
    );

    if (matchedDemo) {
      quickLogin(matchedDemo);
      return {
        error: null,
        admin: matchedDemo.role === 'admin',
        provider: matchedDemo.role === 'merchant' || matchedDemo.role === 'designer',
      };
    }

    // 2. الحساب السري لمديرة المنصة
    if (normalized === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdminSession(true);
      writeAdminSession(true);
      setDemoSession(DEMO_ACCOUNTS[0]);
      writeDemoSession(DEMO_ACCOUNTS[0]);
      return { error: null, admin: true };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const signUp = async (input: SignUpInput) => {
    const normalized = normalizeEmail(input.email);
    const { error } = await supabase.auth.signUp({
      email: normalized,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: input.role,
          phone: input.phone ?? '',
          business_name: input.businessName ?? '',
          specialty: input.specialty ?? '',
          address: input.address ?? '',
          whatsapp: input.whatsapp ?? '',
          years: input.years ?? '',
          bio: input.bio ?? '',
          logo: input.logo ?? '',
        },
      },
    });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    setAdminSession(false);
    writeAdminSession(false);
    setDemoSession(null);
    writeDemoSession(null);
    await supabase.auth.signOut().catch(() => undefined);
    setUser(null);
  };

  const profile = useMemo<EwanProfile | null>(() => {
    if (demoSession) {
      return {
        id: demoSession.id,
        fullName: demoSession.name,
        email: demoSession.email,
        role: demoSession.role,
        businessName: demoSession.businessName,
        storeId: demoSession.storeId,
        designerId: demoSession.designerId,
        specialty: demoSession.badge,
      };
    }
    if (adminSession) return ADMIN_PROFILE;
    const base = toProfile(user);
    if (base && base.email.toLowerCase() === ADMIN_EMAIL) return ADMIN_PROFILE;
    return base;
  }, [demoSession, adminSession, user]);

  const isAdmin = adminSession || profile?.role === 'admin';
  const isProvider = profile?.role === 'merchant' || profile?.role === 'designer';

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      loading,
      isAdmin,
      isProvider,
      signIn,
      quickLogin,
      signUp,
      signOut,
    }),
    [user, profile, loading, isAdmin, isProvider],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
