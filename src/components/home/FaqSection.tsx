import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCatalog } from '@/contexts/CatalogContext';
import { MessageSquare } from 'lucide-react';

export const FaqSection = () => {
  const { faqs } = useCatalog();

  return (
    <section className="w-full bg-[#EFE7DA] py-20 lg:py-24 border-t border-[#E5DEC9]">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14 items-start">
          <div className="md:col-span-5 space-y-4">
            <span className="eyebrow text-[#9C6644]">الأسئلة الشائعة</span>
            <h2 className="font-display text-3xl sm:text-4xl leading-tight text-[#231F1E]">
              كل ما تحتاج معرفته قبل الطلب
            </h2>
            <p className="max-w-sm text-pretty text-sm sm:text-base leading-relaxed text-[#6B5E55]">
              إجابات مباشرة عن تفصيل الأثاث، طرق الدفع بالريال اليمني، ومواعيد التوصيل والتركيب في المكلا.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#C9B9A6] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#231F1E] shadow-2xs hover:bg-[#FAF7F2] hover:border-[#9C6644] transition-all"
              >
                <MessageSquare className="h-4 w-4 text-[#9C6644]" />
                لديك استفسار آخر؟ تواصل معنا
              </Link>
            </div>
          </div>

          <div className="md:col-span-7">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.dbId || faq.id}
                  value={faq.dbId || faq.id}
                  className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] px-6 shadow-2xs transition-colors hover:border-[#9C6644]/60"
                >
                  <AccordionTrigger className="py-5 text-right text-sm sm:text-base font-semibold text-[#231F1E] hover:text-[#9C6644] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty pb-5 text-sm sm:text-base leading-relaxed text-[#6B5E55] border-t border-[#F0EAE1] pt-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
