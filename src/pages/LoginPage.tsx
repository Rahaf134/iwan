import { useState } from 'react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { heroImage } from '@/data/catalog';

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError('البريد الإلكتروني أو اسم المستخدم أو كلمة المرور غير صحيحة.');
      return;
    }
    if (result.admin) {
      navigate('/admin', { replace: true });
    } else if (result.provider) {
      navigate('/provider', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <PageMeta title="تسجيل الدخول — إيوان" description="سجّل الدخول إلى حسابك في منصة إيوان." />
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-10 md:grid-cols-2 md:items-start md:py-16">
        <div className="order-2 md:order-1">
          <p className="eyebrow">أهلاً بعودتك</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-balance md:text-4xl">
            تسجيل الدخول إلى إيوان
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            تابع طلباتك، أضف وأدر معروضاتك، وتواصل مع الزبائن والمعارض من مكان واحد.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني أو اسم المعرض</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.6}
                />
                <Input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="homecentre أو name@example.com"
                  className="h-12 rounded-xl pr-10"
                  dir="ltr"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.6}
                />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl pr-10"
                  dir="ltr"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-wood/30 bg-sand/40 px-4 py-3 text-xs text-sand-foreground">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="link-underline font-medium text-foreground">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="overflow-hidden rounded-3xl bg-muted">
            <img
              src={heroImage}
              alt="مساحة معيشة دافئة بأثاث خشبي من معارض المكلا"
              className="h-[260px] w-full object-cover md:h-[420px]"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5 text-wood" strokeWidth={1.6} />
            معارض ومصممون موثوقون في المكلا وحضرموت
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
