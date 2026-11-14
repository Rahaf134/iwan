import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';

const FaqPage = () => {
  const { faqs } = useCatalog();

  return (
    <>
      <PageMeta
        title="الأسئلة الشائعة — إيوان المكلا"
        description="كل ما تحتاج معرفته عن الطلب من المعارض، مصمم الذكاء الاصطناعي، التفصيل الخاص، الدفع والتوصيل والضمان."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <p className="eyebrow">الأسئلة الشائعة</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            كل ما تحتاج معرفته قبل أن تطلب
          </h1>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.6fr_1fr] md:gap-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.dbId || faq.id}
                value={faq.dbId || faq.id}
                className="border-border"
              >
                <AccordionTrigger className="py-5 text-right text-sm font-medium hover:no-underline md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-pretty pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-xl text-balance">لم تجد إجابتك؟</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              فريق إيوان في المكلا جاهز للمساعدة في اختيار القطعة أو ترتيب زيارة للمعرض.
            </p>
            <Button
              asChild
              className="mt-5 h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/contact">تواصل معنا</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="mt-2 h-11 w-full rounded-full border-border"
            >
              <Link to="/designer">جرّب مصمم AI</Link>
            </Button>
          </aside>
        </div>
      </div>
    </>
  );
};

export default FaqPage;
