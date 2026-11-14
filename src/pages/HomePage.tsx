import { CategoryStrip } from '@/components/home/CategoryStrip';
import { DesignersStrip } from '@/components/home/DesignersStrip';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { Hero } from '@/components/home/Hero';
import { AiDesignerBanner } from '@/components/home/AiDesignerBanner';
import { FaqSection } from '@/components/home/FaqSection';
import { LookbookSection } from '@/components/home/LookbookSection';
import { PartnersStrip } from '@/components/home/PartnersStrip';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { StoresStrip } from '@/components/home/StoresStrip';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import PageMeta from '@/components/common/PageMeta';

const HomePage = () => (
  <>
    <PageMeta
      title="إيوان | تصميم الأثاث والمساحات بالذكاء الاصطناعي — المكلا"
      description="معارض أثاث حقيقية في المكلا، منتجات بأسعار الريال اليمني، مصممون ونجارون محترفون، ومصمم ذكاء اصطناعي لترتيب مساحتك."
    />
    {/* القسم 1: Hero */}
    <Hero />

    {/* القسم 2: تصفح حسب الفئة */}
    <CategoryStrip />

    {/* القسم 3: القطع المختارة */}
    <FeaturedPieces />

    {/* القسم 4: بانر مصمم الذكاء الاصطناعي الترويجي */}
    <AiDesignerBanner />

    {/* القسم 5: المعارض والمصممون */}
    <StoresStrip />
    <DesignersStrip />

    {/* القسم 6: كتالوج الإلهام في الرئيسية */}
    <LookbookSection />

    {/* القسم 7: آراء العملاء، شركاء النجاح، الأسئلة الشائعة، والنشرة */}
    <TestimonialsSection />
    <PartnersStrip />
    <FaqSection />
    <div className="bg-[#EFE7DA] pt-10 pb-16">
      <NewsletterSection />
    </div>
  </>
);

export default HomePage;
