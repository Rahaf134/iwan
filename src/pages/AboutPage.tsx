import { Link } from 'react-router-dom';
import {
  Compass,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Store,
    title: 'تجمع المعارض المحلية',
    description:
      'تصفح أحدث تشكيلات الأثاث والمطابخ من أشهر معارض المكلا مع معرفة الأسعار والمقاسات والألوان المتوفرة لحظياً.',
  },
  {
    icon: Palette,
    title: 'نخبة المصممين والحرفيين',
    description:
      'تواصل مباشر مع مهندسي الديكور الداخلي ومعلمي النجارة المحليين لتنفيذ التصاميم الخاصة والتفصيل حسب الطلب.',
  },
  {
    icon: Sparkles,
    title: 'مصمم المساحات بالذكاء الاصطناعي',
    description:
      'أداة ذكية تتيح لك تصور غرفتك وتنسيق قطع الأثاث الفعلية من المعارض داخل مساحتك قبل اتخاذ قرار الشراء.',
  },
  {
    icon: ShieldCheck,
    title: 'تجربة طلب موثوقة ومباشرة',
    description:
      'نظام متكامل يربط العميل بالمعرض مباشرة، مع حفظ الطلبات ومحادثات فورية لضمان الشفافية وسرعة التنفيذ.',
  },
];

const steps = [
  {
    step: '1',
    title: 'استكشف وألهم',
    desc: 'تجوّل بين أرقى معارض المكلا وكتالوجات الإلهام، وتعرف على أحدث الموديلات والخامات المتوفرة محلياً.',
  },
  {
    step: '2',
    title: 'اختر ونسّق',
    desc: 'رتّب مساحتك بمساعد الذكاء الاصطناعي، أو تواصل مباشرة مع مصمم ديكور أو نجار لتفصيل طلبك الخاص.',
  },
  {
    step: '3',
    title: 'اطلب بثقة',
    desc: 'أرسل طلبك بنقرة زر إلى المعرض، مع متابعة دقيقة لمراحل التجهيز والتوصيل حتى باب منزلك.',
  },
];

const AboutPage = () => {
  return (
    <>
      <PageMeta
        title="من نحن — منصة إيوان لتصميم وتأثيث المساحات"
        description="المنصة الرقمية الأولى في حضرموت التي تجمع أرقى معارض الأثاث والمطابخ ونخبة مصممي الديكور في مكان واحد."
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 md:px-8 md:pb-28 pt-4 sm:pt-8 space-y-16 sm:space-y-24">
        {/* ==================== 1. Hero Section فخم مع صورة معبرة ==================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* العمود الأيمن: العناوين والمقدمة */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8CBB8] bg-[#F5EFE6] px-4 py-1.5 text-xs font-semibold text-[#8C7355]">
              <Layers className="h-3.5 w-3.5" />
              من نحن — حكاية إيوان
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#231F1E]">
              إيوان.. مساحتك تبدأ من هنا
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#5C4938]">
              المنصة الرقمية الأولى في حضرموت التي تجمع أرقى معارض الأثاث، المطابخ، ونخبة مصممي
              الديكور الداخلي وحرفيي النجارة في مكان واحد.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-[#231F1E] px-7 text-sm font-semibold text-white hover:bg-[#5C4938] transition-colors shadow-xs"
              >
                <Link to="/stores">استكشف المعارض</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-[#D8CBB8] bg-[#FAF7F2] px-6 text-sm font-semibold text-[#231F1E] hover:bg-[#F5EFE6]"
              >
                <Link to="/designer">مصمم الذكاء الاصطناعي</Link>
              </Button>
            </div>
          </div>

          {/* العمود الأيسر: صورة ديكور داخلي فخمة وشريط حلقة الوصل */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-sm relative">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
                alt="تصميم داخلي وأثاث راقٍ — إيوان"
                className="w-full h-[280px] sm:h-[380px] lg:h-[420px] object-cover transition-transform duration-700 hover:scale-[1.02]"
                loading="eager"
              />
            </div>

            {/* شريط بصري أنيق يوضح حلقة الوصل */}
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#F5EFE6] px-4 py-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#231F1E]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#8C7355]" />
                  العميل
                </span>
                <span className="text-[#8C7355] text-base font-bold">⟵</span>
                <span className="rounded-full bg-[#231F1E] text-white px-3.5 py-1 text-xs font-bold shadow-2xs">
                  منصة إيوان
                </span>
                <span className="text-[#8C7355] text-base font-bold">⟵</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#8C7355]" />
                  المعارض والمصممون
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. قصتنا — لماذا إيوان؟ ==================== */}
        <section>
          <div className="rounded-3xl border border-[#E5DEC9] bg-[#F5EFE6] p-7 sm:p-10 md:p-12 shadow-xs">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold text-[#8C7355] tracking-wide">
                البداية والرؤية
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231F1E]">
                قصتنا — لماذا إيوان؟
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#5C4938]">
                جاءت فكرة إيوان لتختصر على سكان مدينة المكلا عناء البحث والتنقل الطويل بين المعارض
                وورش النجارة لتأثيث منازلهم. بنينا جسراً رقمياً يجمع المعارض المحلية الموثوقة وأمهر
                المهندسين والحرفيين في منصة واحدة؛ لنحول رحلة تأثيث المنزل وتصميمه من مهمة مرهقة
                إلى تجربة بصرية ممتعة وميسّرة بضغطة زر.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 3. ماذا نقدم؟ (4 بطاقات متناسقة) ==================== */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#8C7355]">خدمات وحلول متكاملة</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231F1E]">
              ماذا نقدم لك في إيوان؟
            </h2>
            <p className="text-sm text-[#786C65]">
              منظومة متكاملة تلبي كافة احتياجاتك لتصميم وتأثيث مساحتك الخاصة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-7 shadow-xs hover:border-[#8C7355]/40 transition-all space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EFE6] text-[#8C7355] border border-[#E5DEC9]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#231F1E]">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5C4938]">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================== 4. رحلة العميل في 3 خطوات ==================== */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#8C7355]">بسيطة وسلسة</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231F1E]">
              رحلتك في إيوان بـ 3 خطوات
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((st) => (
              <div
                key={st.step}
                className="rounded-3xl border border-[#E5DEC9] bg-[#F5EFE6]/70 p-7 shadow-2xs space-y-3 relative"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#231F1E] text-white font-display text-lg font-bold shadow-2xs">
                  {st.step}
                </div>
                <h3 className="font-display text-lg font-bold text-[#231F1E]">
                  {st.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5C4938]">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== 5. رؤيتنا ورسالتنا ==================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بطاقة رؤيتنا */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-8 shadow-xs space-y-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EFE6] text-[#8C7355] border border-[#E5DEC9]">
              <Compass className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#231F1E]">
              رؤيتنا
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#5C4938]">
              أن نكون الوجهة الرقمية الأولى لتصميم وتأثيث المساحات السكنية والتجارية في اليمن،
              والمرجع الأساسي لكل من يبحث عن الجمال والجودة.
            </p>
          </div>

          {/* بطاقة رسالتنا */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-8 shadow-xs space-y-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EFE6] text-[#8C7355] border border-[#E5DEC9]">
              <Target className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#231F1E]">
              رسالتنا
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#5C4938]">
              تمكين معارض الأثاث والمواهب الهندسية والحرفية في المكلا من التحول الرقمي، والوصول إلى
              العملاء بتجربة عصرية تحاكي أرقى المعايير العالمية.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
