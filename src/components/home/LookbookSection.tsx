import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { lookbook } from '@/data/catalog';

export const LookbookSection = () => {
  const { lookbookItems } = useCatalog();
  const items = (lookbookItems && lookbookItems.length > 0 ? lookbookItems : lookbook).slice(0, 3);

  return (
    <section className="w-full bg-[#EFE7DA] py-20 lg:py-24 border-y border-[#E5DEC9]">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* العمود الأيمن: العنوان والوصف والزر */}
          <div className="lg:col-span-4 space-y-5">
            <span className="eyebrow text-[#9C6644]">كتالوج الإلهام</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#231F1E]">
              مساحات حقيقية من بيوت حضرموت
            </h2>
            <p className="text-pretty text-sm sm:text-base leading-relaxed text-[#6B5E55]">
              استكشف غرفاً ومجالس ومطابخ صُممت ونُفذت بأثاث معارض المكلا المعتمدة. استلهم توزيع المساحات وتناسق الألوان قبل أن تبدأ بالتأثيث.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 rounded-full bg-[#231F1E] px-7 text-white hover:bg-[#9C6644] text-sm font-semibold shadow-sm transition-all"
              >
                <Link to="/lookbook">
                  استكشف كتالوج الإلهام
                  <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.8} />
                </Link>
              </Button>
            </div>
          </div>

          {/* العمود الأيسر: 3 بطاقات صور طولية متساوية الارتفاع تماماً aspect-[3/4] */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/lookbook"
                  className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#D9CBB6] shadow-sm border border-[#E5DEC9] transition-transform duration-500 hover:-translate-y-2 hover:shadow-lg"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-5 flex flex-col justify-end text-white">
                    <span className="text-[11px] font-medium text-[#EFE7DA] tracking-wide mb-1">
                      {item.area} · {item.style}
                    </span>
                    <h3 className="text-base font-semibold leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
