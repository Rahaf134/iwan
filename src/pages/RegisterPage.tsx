import { useState } from 'react';
import { Hammer, Store, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const roleOptions: { value: UserRole; label: string; hint: string; icon: typeof User }[] = [
  { value: 'customer', label: 'عميل', hint: 'أتصفح وأطلب قطعاً', icon: User },
  { value: 'merchant', label: 'متجر / معرض', hint: 'أعرض منتجاتي', icon: Store },
  { value: 'designer', label: 'مصمم / نجار', hint: 'أقدم خدماتي', icon: Hammer },
];

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('customer');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    specialty: '',
    address: '',
    whatsapp: '',
    years: '',
    bio: '',
    logo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isProvider = role === 'merchant' || role === 'designer';

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signUp({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role,
      phone: form.phone,
      businessName: isProvider ? form.businessName : undefined,
      specialty: isProvider ? form.specialty : undefined,
      address: isProvider ? form.address : undefined,
      whatsapp: isProvider ? form.whatsapp : undefined,
      years: isProvider ? form.years : undefined,
      bio: isProvider ? form.bio : undefined,
      logo: isProvider ? form.logo : undefined,
    });
    setLoading(false);
    if (result.error) {
      setError('تعذّر إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى.');
      return;
    }
    toast.success('تم إنشاء الحساب بنجاح! تم تسجيل دخولك تلقائياً.');
    if (isProvider) {
      navigate('/provider', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <PageMeta title="إنشاء حساب — إيوان" description="أنشئ حسابك في منصة إيوان كعميل أو معرض أو مصمم." />
      <section className="mx-auto w-full max-w-3xl px-6 py-10 md:py-16">
        <p className="eyebrow">انضم إلى إيوان</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-balance md:text-4xl">
          إنشاء حساب جديد
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          اختر نوع الحساب لتظهر لك الحقول المناسبة، ثم أكمل بياناتك للانضمام إلى منصة إيوان.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-4 text-right transition-colors',
                  active
                    ? 'border-wood bg-sand/50'
                    : 'border-border bg-card hover:border-wood/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    active ? 'bg-wood text-primary-foreground' : 'bg-muted text-wood',
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
                placeholder="مثال: سالم باوزير"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="name@example.com"
                className="h-12 rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input
                id="phone"
                required
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="+967 7XX XXX XXX"
                className="h-12 rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="6 أحرف على الأقل"
                className="h-12 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {isProvider && (
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-wood">
                بيانات {role === 'merchant' ? 'المعرض' : 'المصمم / النجار'}
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {role === 'merchant' ? 'اسم المعرض' : 'الاسم المهني'}
                  </Label>
                  <Input
                    id="businessName"
                    required
                    value={form.businessName}
                    onChange={(event) => update('businessName', event.target.value)}
                    placeholder={role === 'merchant' ? 'معرض … للأثاث' : 'ورشة … للنجارة'}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">التخصص</Label>
                  <Input
                    id="specialty"
                    required
                    value={form.specialty}
                    onChange={(event) => update('specialty', event.target.value)}
                    placeholder="مطابخ حديثة، غرف نوم، مجالس…"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان / الموقع</Label>
                  <Input
                    id="address"
                    required
                    value={form.address}
                    onChange={(event) => update('address', event.target.value)}
                    placeholder="المكلا — الديس"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">رقم الواتساب للطلبات</Label>
                  <Input
                    id="whatsapp"
                    required
                    value={form.whatsapp}
                    onChange={(event) => update('whatsapp', event.target.value)}
                    placeholder="9677XXXXXXXX"
                    className="h-12 rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">سنوات الخبرة</Label>
                  <Input
                    id="years"
                    required
                    value={form.years}
                    onChange={(event) => update('years', event.target.value)}
                    placeholder="مثال: 7"
                    className="h-12 rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">نبذة مختصرة</Label>
                  <Textarea
                    id="bio"
                    required
                    rows={3}
                    value={form.bio}
                    onChange={(event) => update('bio', event.target.value)}
                    placeholder="اكتب نبذة عن أعمالك وخدماتك…"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <ImageUploadField
                value={form.logo}
                onChange={(value) => update('logo', value)}
                label={role === 'merchant' ? 'شعار المعرض' : 'صورة من أعمالك'}
                hint="صورة واضحة تُعرض في صفحة المعارض أو المصممين"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-wood/30 bg-sand/40 px-4 py-3 text-xs text-sand-foreground">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto md:px-10"
          >
            {loading ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="link-underline font-medium text-foreground">
            تسجيل الدخول
          </Link>
        </p>
      </section>
    </>
  );
};

export default RegisterPage;
