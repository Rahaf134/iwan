import { useState } from 'react';
import { Hammer, MailCheck, Store, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      setError(result.error.message || 'تعذّر إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى.');
      return;
    }
    setRegisteredEmail(form.email);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (success) {
    return (
      <>
        <PageMeta
          title="تم إنشاء الحساب بنجاح — إيوان"
          description="تم إنشاء حسابك في منصة إيوان بنجاح. يرجى توثيق بريدك الإلكتروني."
        />
        <section className="mx-auto w-full max-w-2xl px-6 py-12 md:py-20">
          <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EDE2]/80 p-8 sm:p-12 text-center shadow-xl backdrop-blur-sm">
            {/* أيقونة البريد الكبيرة الأنيقة */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#DED4C6] bg-[#FAF7F2] text-[#9C6644] shadow-inner">
              <MailCheck className="h-10 w-10 text-[#9C6644]" strokeWidth={1.6} />
            </div>

            {/* العنوان الرئيسي */}
            <h1 className="font-display text-2xl font-bold text-[#231F1E] sm:text-3xl">
              تم إنشاء حسابك بنجاح! 📩
            </h1>

            {/* نص التأكيد الصريح والمطلوب */}
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#5C534E]">
              لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني{' '}
              {registeredEmail && (
                <span className="font-semibold text-[#231F1E] font-mono px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E5DEC9]" dir="ltr">
                  {registeredEmail}
                </span>
              )}
              . يرجى فتح بريدك والضغط على الرابط لتوثيق حسابك ثم تسجيل الدخول.
            </p>

            {/* بطاقة إرشادية بألوان إيوان الدافئة */}
            <div className="mt-8 rounded-2xl border border-[#DED4C6] bg-[#FAF7F2]/90 p-4 text-xs text-[#786C65] text-right">
              <p className="font-bold text-[#231F1E] mb-1">💡 لم تجد رسالة التفعيل؟</p>
              <p className="leading-relaxed">
                يرجى تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk)؛ قد يستغرق وصول الرابط دقيقة أو دقيقتين.
              </p>
            </div>

            {/* أزرار الإجراء */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate('/login')}
                className="h-12 w-full sm:w-auto rounded-full bg-[#231F1E] px-8 text-white hover:bg-[#9C6644] text-sm font-semibold transition-all shadow-md"
              >
                الذهاب لصفحة تسجيل الدخول
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setForm({
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
                }}
                className="h-12 w-full sm:w-auto rounded-full border-[#DED4C6] bg-[#FAF7F2] px-6 text-[#5C534E] hover:bg-[#E5DEC9]/40 text-sm"
              >
                تسجيل حساب جديد آخر
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

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
