import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 md:px-14 md:py-16">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[11px] font-semibold text-primary-foreground/70">النشرة البريدية</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance text-primary-foreground md:text-4xl">
              وصل حديثاً إلى معارض المكلا
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/70">
              اشترك لتصلك القطع الجديدة والعروض المحلية قبل الجميع — بدون إزعاج.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) {
                toast.error('أدخل بريدك الإلكتروني أولاً');
                return;
              }
              toast.success('تم تسجيل بريدك بنجاح', {
                description: 'سنرسل لك أول تحديث من معارض المكلا.',
              });
              setEmail('');
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="بريدك الإلكتروني"
              aria-label="البريد الإلكتروني"
              className="h-12 flex-1 rounded-full border-primary-foreground/25 bg-primary-foreground/10 px-5 text-base text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button
              type="submit"
              variant="ghost"
              className="h-12 shrink-0 rounded-full bg-primary-foreground px-6 text-primary hover:bg-primary-foreground/90"
            >
              اشترك
              <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.8} />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
