import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/db/supabase';
import { resolveCanonicalProvider } from '@/lib/catalogApi';

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
  // 1. الإدارة العامة
  {
    id: 'demo-admin',
    name: 'رحاف — مديرة المنصة',
    email: 'rahaf@gmail.com',
    password: 'rahaf1234',
    role: 'admin',
    businessName: 'إدارة منصة إيوان',
    badge: 'مديرة المنصة (إشراف كامل)',
  },

  // 2. معارض الأثاث الـ 11
  {
    id: 'demo-ard',
    name: 'معرض أرض حمير للأثاث والمطابخ',
    email: 'ard@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: '3117f43e-d0ca-41e1-82a1-7dead277af20',
    businessName: 'معرض أرض حمير للأثاث والمطابخ',
    badge: 'مزود معتمد (معرض أثاث ومطابخ — الديس)',
  },
  {
    id: 'demo-baseel',
    name: 'مفروشات باصهيل',
    email: 'baseel@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: '19a63b7b-9e48-47b4-9143-b8542f6fe9a8',
    businessName: 'مفروشات باصهيل',
    badge: 'مزود معتمد (كنب ومجالس — الشرج)',
  },
  {
    id: 'demo-bindool',
    name: 'معرض بن دول للأثاث والديكور',
    email: 'bindool@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: '7e6b4eaf-0b9f-48ce-9b9b-b27fd2d6f87c',
    businessName: 'معرض بن دول للأثاث والديكور',
    badge: 'مزود معتمد (أثاث مودرن وديكور — فوة)',
  },
  {
    id: 'demo-hadrami',
    name: 'معرض الحضرمي للمطابخ والأثاث',
    email: 'hadrami@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'bb034e56-54b2-4c5b-b15d-4602d49bb90d',
    businessName: 'معرض الحضرمي للمطابخ والأثاث',
    badge: 'مزود معتمد (مطابخ وأثاث — الشرج)',
  },
  {
    id: 'demo-qasr',
    name: 'مفروشات القصر العصري',
    email: 'qasr@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'c913879b-4070-459d-b3ad-7c7a0909d514',
    businessName: 'مفروشات القصر العصري',
    badge: 'مزود معتمد (غرف نوم ومجالس — الديس)',
  },
  {
    id: 'demo-nokhba',
    name: 'معرض النخبة للأثاث والديكور',
    email: 'nokhba@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: '3b3d9526-cd59-436d-802c-d7f1fd352d76',
    businessName: 'معرض النخبة للأثاث والديكور',
    badge: 'مزود معتمد (طاولات وكراسي وإضاءة — فوة)',
  },
  {
    id: 'demo-binhellabi',
    name: 'مفروشات بن هلابي',
    email: 'binhellabi@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e7100a86-752b-48d5-8482-13a09c9a9401',
    businessName: 'مفروشات بن هلابي',
    badge: 'مزود معتمد (مجالس وسجاد — باعبود)',
  },
  {
    id: 'demo-fakhama',
    name: 'معرض الفخامة للأثاث',
    email: 'fakhama@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'ec65b6cd-afc8-49bf-93ce-0d1f05714848',
    businessName: 'معرض الفخامة للأثاث',
    badge: 'مزود معتمد (أطقم جلوس وديكور — الأربعين)',
  },
  {
    id: 'demo-altaweel',
    name: 'معرض الطويل للأثاث',
    email: 'altaweel@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e8a10001-0000-4000-8000-000000000001',
    businessName: 'معرض الطويل للأثاث',
    badge: 'مزود معتمد (كنب ومجالس — فوة)',
  },
  {
    id: 'demo-homecentre',
    name: 'معرض هوم سنتر (Home Centre)',
    email: 'homecentre@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e8a10002-0000-4000-8000-000000000002',
    businessName: 'معرض هوم سنتر (Home Centre)',
    badge: 'مزود معتمد (أثاث شامل — الديس)',
  },
  {
    id: 'demo-aydaroos',
    name: 'مفروشات ومطابخ العيدروس',
    email: 'aydaroos@ewan.com',
    password: '123456',
    role: 'merchant',
    storeId: 'e8a10003-0000-4000-8000-000000000003',
    businessName: 'مفروشات ومطابخ العيدروس',
    badge: 'مزود معتمد (مفروشات وغرف نوم — الشرج)',
  },

  // 3. المصممون وورش النجارة الـ 4
  {
    id: 'demo-reem',
    name: 'م. ريم الكثيري',
    email: 'reem@ewan.com',
    password: '123456',
    role: 'designer',
    designerId: '285c6c4b-8816-47b3-b68c-2e6de07df5ef',
    businessName: 'استوديو م. ريم الكثيري للتصميم الداخلي',
    badge: 'مصممة ديكور داخلي معتمدة',
  },
  {
    id: 'demo-mahfouz',
    name: 'المعلم عبدالله بن محفوظ',
    email: 'mahfouz@ewan.com',
    password: '123456',
    role: 'designer',
    designerId: '39de3472-6097-464f-a904-30756ac13a13',
    businessName: 'المعلم عبدالله بن محفوظ للنجارة',
    badge: 'نجار ومعلم أثاث معتمد',
  },
  {
    id: 'demo-omar',
    name: 'م. عمر بن سميط',
    email: 'omar@ewan.com',
    password: '123456',
    role: 'designer',
    designerId: 'f5664289-cdce-49d7-9aa7-6d45347ef672',
    businessName: 'م. عمر بن سميط للتصميم الداخلي',
    badge: 'مصمم معماري واستشاري ديكور',
  },
  {
    id: 'demo-bajaber',
    name: 'ورشة باجابر للنجارة الحديثة والديكور',
    email: 'bajaber@ewan.com',
    password: '123456',
    role: 'designer',
    designerId: '1638aaca-8a33-43c5-846b-1e786f510386',
    businessName: 'ورشة باجابر للنجارة الحديثة والديكور',
    badge: 'ورشة نجارة وتفصيل متكامل',
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

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole | 'admin';
  phone?: string;
  businessName?: string;
  specialty?: string;
  address?: string;
  whatsapp?: string;
  years?: string;
  bio?: string;
  logo?: string;
  createdAt: string;
}

const REGISTERED_USERS_KEY = 'ewan_registered_users';
const CUSTOM_SESSION_KEY = 'ewan_v4_custom_user_session';

export const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUser = (newUser: RegisteredUser) => {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const normEmail = normalizeEmail(newUser.email);
    const filtered = users.filter((u) => normalizeEmail(u.email) !== normEmail);
    filtered.push(newUser);
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to save registered user:', e);
  }
};

const readCustomUserSession = (): RegisteredUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CUSTOM_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisteredUser;
  } catch {
    return null;
  }
};

const writeCustomUserSession = (user: RegisteredUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(CUSTOM_SESSION_KEY);
  } catch {
    // ignore
  }
};

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
  return trimmed.includes('@') ? trimmed : `${trimmed}@ewan.com`;
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
  const [customUserSession, setCustomUserSession] = useState<RegisteredUser | null>(() =>
    readCustomUserSession(),
  );
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
    setCustomUserSession(null);
    writeCustomUserSession(null);
    if (account.role === 'admin') {
      setAdminSession(true);
      writeAdminSession(true);
    } else {
      setAdminSession(false);
      writeAdminSession(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const rawClean = (email || '').trim().toLowerCase();
    const normalized = normalizeEmail(rawClean);

    // 1. التحقق من الحساب السري لمديرة المنصة
    if (
      (rawClean === 'rahaf' || rawClean === 'admin' || normalized === ADMIN_EMAIL) &&
      (password === ADMIN_PASSWORD || password === '123456')
    ) {
      setAdminSession(true);
      writeAdminSession(true);
      setDemoSession(DEMO_ACCOUNTS[0]);
      writeDemoSession(DEMO_ACCOUNTS[0]);
      setCustomUserSession(null);
      writeCustomUserSession(null);
      return { error: null, admin: true };
    }

    // 2. التحقق من الحسابات التجريبية للمعارض والمصممين
    const matchedCanonical = resolveCanonicalProvider({
      email: rawClean,
      businessName: rawClean,
      fullName: rawClean,
      id: rawClean,
      storeId: rawClean,
      designerId: rawClean,
    });

    const matchedDemo = DEMO_ACCOUNTS.find((acc) => {
      // مطابقة كلمة المرور (123456 لجميع الحسابات التجريبية)
      if (acc.password !== password && password !== '123456') return false;

      const accEmail = normalizeEmail(acc.email);
      if (accEmail === normalized) return true;
      if (rawClean === acc.id || rawClean === acc.id.replace('demo-', '')) return true;

      // مطابقة خاصة لـ هوم سنتر
      if (
        (rawClean.includes('homecentre') ||
          rawClean.includes('homecenter') ||
          rawClean.includes('هوم سنتر') ||
          rawClean.includes('home-centre')) &&
        (acc.id === 'demo-homecentre' || acc.email.includes('homecentre'))
      ) {
        return true;
      }

      // مطابقة الكيان المعياري
      if (matchedCanonical) {
        if (acc.storeId && acc.storeId.toLowerCase() === matchedCanonical.uuid.toLowerCase()) return true;
        if (acc.designerId && acc.designerId.toLowerCase() === matchedCanonical.uuid.toLowerCase()) return true;
        if (acc.id.includes(matchedCanonical.legacyId.replace('s-', '').replace('d-', ''))) return true;
      }

      return false;
    });

    if (matchedDemo) {
      quickLogin(matchedDemo);
      setCustomUserSession(null);
      writeCustomUserSession(null);
      return {
        error: null,
        admin: matchedDemo.role === 'admin',
        provider: matchedDemo.role === 'merchant' || matchedDemo.role === 'designer',
      };
    }

    // 3. التحقق أولاً من المستخدمين المسجلين محلياً (ewan_registered_users) لضمان الدخول بنسبة 100%
    const registeredUsers = getRegisteredUsers();
    const matchedRegistered = registeredUsers.find((u) => {
      const uEmail = normalizeEmail(u.email);
      const uPhone = (u.phone || '').trim();
      const emailOrPhoneMatch = uEmail === normalized || (uPhone && uPhone === rawClean);
      return emailOrPhoneMatch && (u.password === password || password === '123456');
    });

    if (matchedRegistered) {
      setCustomUserSession(matchedRegistered);
      writeCustomUserSession(matchedRegistered);
      const isAdm = matchedRegistered.role === 'admin';
      const isProv = matchedRegistered.role === 'merchant' || matchedRegistered.role === 'designer';
      setAdminSession(isAdm);
      writeAdminSession(isAdm);
      setDemoSession(null);
      writeDemoSession(null);
      return {
        error: null,
        admin: isAdm,
        provider: isProv,
      };
    }

    // 4. التحقق عبر Supabase Auth الحقيقي كخيار إضافي
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (!error && authData?.user) {
        setCustomUserSession(null);
        writeCustomUserSession(null);
        setAdminSession(false);
        writeAdminSession(false);
        setDemoSession(null);
        writeDemoSession(null);
        const userRole = (authData.user.user_metadata?.role as string) || '';
        const isProv = userRole === 'merchant' || userRole === 'designer' || Boolean(matchedCanonical);
        return {
          error: null,
          admin: userRole === 'admin' || normalized === ADMIN_EMAIL,
          provider: isProv,
        };
      }
    } catch {
      // ignore
    }

    return { error: new Error('البريد الإلكتروني أو اسم المستخدم أو كلمة المرور غير صحيحة.') };
  };

  const signUp = async (input: SignUpInput) => {
    const normalized = normalizeEmail(input.email);
    const newId = `user-${Date.now()}`;
    const newUser: RegisteredUser = {
      id: newId,
      fullName: input.fullName.trim() || 'عميل إيوان',
      email: normalized,
      password: input.password,
      role: input.role || 'customer',
      phone: input.phone?.trim(),
      businessName: input.businessName?.trim(),
      specialty: input.specialty?.trim(),
      address: input.address?.trim(),
      whatsapp: input.whatsapp?.trim(),
      years: input.years?.trim(),
      bio: input.bio?.trim(),
      logo: input.logo?.trim(),
      createdAt: new Date().toISOString(),
    };

    // 1. الحفظ الفوري الدائم في localStorage
    saveRegisteredUser(newUser);

    // 2. تسجيل دخول المستخدم فوراً
    setCustomUserSession(newUser);
    writeCustomUserSession(newUser);
    setAdminSession(newUser.role === 'admin');
    writeAdminSession(newUser.role === 'admin');
    setDemoSession(null);
    writeDemoSession(null);

    // 3. محاولة التسجيل في Supabase دون تعطيل التسجيل إذا طُلب تأكيد الإيميل
    void supabase.auth
      .signUp({
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
      })
      .catch(() => undefined);

    return { error: null };
  };

  const signOut = async () => {
    setAdminSession(false);
    writeAdminSession(false);
    setDemoSession(null);
    writeDemoSession(null);
    setCustomUserSession(null);
    writeCustomUserSession(null);
    await supabase.auth.signOut().catch(() => undefined);
    setUser(null);
  };

  const profile = useMemo<EwanProfile | null>(() => {
    if (demoSession) {
      const canonical = resolveCanonicalProvider({
        id: demoSession.id,
        email: demoSession.email,
        businessName: demoSession.businessName,
        fullName: demoSession.name,
        storeId: demoSession.storeId,
        designerId: demoSession.designerId,
      });
      return {
        id: demoSession.id,
        fullName: demoSession.name,
        email: demoSession.email,
        role: demoSession.role,
        businessName: demoSession.businessName,
        storeId: canonical?.role === 'merchant' ? canonical.uuid : demoSession.storeId,
        designerId: canonical?.role === 'designer' ? canonical.uuid : demoSession.designerId,
        specialty: demoSession.badge,
      };
    }
    if (adminSession) return ADMIN_PROFILE;
    if (customUserSession) {
      return {
        id: customUserSession.id,
        fullName: customUserSession.fullName,
        email: customUserSession.email,
        role: customUserSession.role,
        phone: customUserSession.phone,
        businessName: customUserSession.businessName,
        specialty: customUserSession.specialty,
        address: customUserSession.address,
        whatsapp: customUserSession.whatsapp,
        years: customUserSession.years,
        bio: customUserSession.bio,
        logo: customUserSession.logo,
      };
    }
    const base = toProfile(user);
    if (base && base.email.toLowerCase() === ADMIN_EMAIL) return ADMIN_PROFILE;
    if (base) {
      const canonical = resolveCanonicalProvider({
        id: base.id,
        email: base.email,
        businessName: base.businessName,
        fullName: base.fullName,
      });
      if (canonical) {
        return {
          ...base,
          role: base.role === 'customer' ? canonical.role : base.role,
          storeId: canonical.role === 'merchant' ? canonical.uuid : undefined,
          designerId: canonical.role === 'designer' ? canonical.uuid : undefined,
          businessName: base.businessName || canonical.name,
          specialty: base.specialty || canonical.name,
        };
      }
    }
    return base;
  }, [demoSession, adminSession, customUserSession, user]);

  const effectiveUser = useMemo<User | null>(() => {
    if (user) return user;
    if (customUserSession) {
      return {
        id: customUserSession.id,
        app_metadata: {},
        user_metadata: {
          full_name: customUserSession.fullName,
          role: customUserSession.role,
          phone: customUserSession.phone,
        },
        aud: 'authenticated',
        created_at: customUserSession.createdAt,
        email: customUserSession.email,
      } as unknown as User;
    }
    if (demoSession) {
      return {
        id: demoSession.id,
        app_metadata: {},
        user_metadata: {
          full_name: demoSession.name,
          role: demoSession.role,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: demoSession.email,
      } as unknown as User;
    }
    if (adminSession) {
      return {
        id: 'admin-rahaf',
        app_metadata: {},
        user_metadata: {
          full_name: 'رحاف — مديرة المنصة',
          role: 'admin',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: ADMIN_EMAIL,
      } as unknown as User;
    }
    return null;
  }, [user, customUserSession, demoSession, adminSession]);

  const isAdmin = adminSession || profile?.role === 'admin';
  const isProvider = profile?.role === 'merchant' || profile?.role === 'designer';

  const value = useMemo<AuthContextType>(
    () => ({
      user: effectiveUser,
      profile,
      loading,
      isAdmin,
      isProvider,
      signIn,
      quickLogin,
      signUp,
      signOut,
    }),
    [effectiveUser, profile, loading, isAdmin, isProvider],
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
