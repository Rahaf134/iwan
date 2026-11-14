import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';

const AboutPage = () => {
  const { stores, designers, products } = useCatalog();

  return (
    <>
      <PageMeta
        title="من نحن — إيوان المكلا"
        description="إيوان منصة حضرمية تربط معارض الأثاث والمصممين والنجارين في المكلا."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <p className="eyebrow">من نحن</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-balance md:text-5xl">
            نُقرّب المسافة بين بيتك وورشة النجارة في المكلا
          </h1>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="space-y-5 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              بدأت إيوان من سؤال بسيط: لماذا يضطر أهل المكلا إلى السفر أو البحث الطويل لاختيار
              قطعة أثاث تناسب بيتهم؟ فجمعنا المعارض الحقيقية في الديس والشرج وفوة وباعبود والأربعين
              في مكان واحد، مع أسعارها بالريال اليمني ومقاساتها وخاماتها.
            </p>
            <p>
              ثم أضفنا الطبقة التي كانت ناقصة: المصممون والنجارون. فبدل أن تشتري قطعة جاهزة قد لا
              تناسب مساحتك، يمكنك الآن طلب تفصيل خاص من ورشة محلية، أو استشارة مصمم داخلي يعرف
              طبيعة البيوت الحضرمية.
            </p>
            <p>
              وأخيراً، مصمم الذكاء الاصطناعي — أداة تساعدك على تصوّر لوحة الألوان والقطع المناسبة
              قبل أن تدفع ريالاً واحداً.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 self-start rounded-3xl border border-border bg-card p-6">
            <div>
              <p className="font-display text-3xl">{stores.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">معرض موثوق</p>
            </div>
            <div>
              <p className="font-display text-3xl">{products.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">قطعة معروضة</p>
            </div>
            <div>
              <p className="font-display text-3xl">{designers.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">مصمم ونجار</p>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-3xl bg-secondary p-8 md:p-12">
          <h2 className="font-display text-2xl text-balance md:text-3xl">جاهز تبدأ؟</h2>
          <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            تصفّح المعارض، أو جرّب مصمم الذكاء الاصطناعي، أو تواصل معنا مباشرة.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-full bg-primary px-6 text-primary-foreground">
              <Link to="/stores">دليل المعارض</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full border-border px-6">
              <Link to="/designer">مصمم AI</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
