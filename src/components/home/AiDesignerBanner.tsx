import { ArrowLeft, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AiDesignerBanner = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-[#E2D9C8] bg-gradient-to-l from-[#EFE7DA] via-[#F7F2EB] to-[#FAF7F2] p-8 md:p-14 shadow-xs">
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#9C6644]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-0 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl" />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D8CCBA] bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#9C6644] backdrop-blur shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              أداة الذكاء الاصطناعي الأولى في حضرموت
            </span>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight text-[#231F1E]">
              تخيّل غرفتك مؤثثة بالكامل قبل أن تدفع ريالاً واحداً
            </h2>

            <p className="max-w-2xl text-pretty text-sm sm:text-base leading-relaxed text-[#6B5E55]">
              ارفع صورة غرفتك الحالية أو حدّد أبعادها وطابعها اللوني، ودع مصممنا الذكي يوزّع قطع الأثاث من معارض المكلا المتطابقة في أقل من 60 ثانية.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-[#5C534E] font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#9C6644]" />
                مقارنة تفاعلية (قبل / بعد)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#5C534E] font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#9C6644]" />
                نقاط تسوق ذكية فوق الأثاث
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#5C534E] font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#9C6644]" />
                مطابقة حقيقية بأسعار الريال اليمني
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
            <Button
              asChild
              className="h-13 rounded-full bg-[#231F1E] px-8 text-white hover:bg-[#9C6644] shadow-md text-sm font-semibold transition-all active:scale-95 w-full sm:w-auto"
            >
              <Link to="/designer">
                <Wand2 className="ml-2 h-4 w-4" />
                جرّب مصمم الغرف الآن (مجاناً)
                <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Button>
            <span className="text-[11px] text-[#8C7D73] font-medium self-center lg:self-auto">
              لا يلزم تسجيل حساب للتجربة
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
