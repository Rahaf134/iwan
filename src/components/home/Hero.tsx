import { ArrowLeft, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { formatPrice, heroImage } from '@/data/catalog';

const heroFeatures = [
  { icon: ShieldCheck, label: 'ضمان وجودة محلية عالية' },
  { icon: Truck, label: 'توصيل وتركيب داخل المكلا' },
  { icon: Sparkles, label: 'تصميم ومطابقة ذكية بالـ AI' },
];

export const Hero = () => {
  const { products } = useCatalog();
  const heroProduct = products[0];

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] min-h-[82vh] flex items-center py-16 lg:py-24 border-b border-[#E5DEC9]">
      <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-[#9C6644]/5 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-72 w-72 rounded-full bg-[#EFE7DA] blur-2xl" />

      <div className="mx-auto w-full max-w-7xl px-6 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* النصوص والمعلومات */}
          <div className="lg:col-span-6 reveal">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.45] tracking-tight text-balance text-[#231F1E]">
              جمال يصنع <span className="text-[#9C6644] font-normal">على ذوقك،</span>
              <span className="block mt-2 font-display text-[#231F1E]">
                وتفاصيل أثاث تلهم بيتك.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base sm:text-lg leading-relaxed text-[#5C534E]">
              من تفاصيل الأثاث إلى تناغم الألوان، اكتشف خيارات تلهمك وصمّم مساحتك برؤية أقرب لما تحلم به.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="h-13 rounded-full bg-[#231F1E] px-8 text-white hover:bg-[#9C6644] shadow-sm text-sm font-medium transition-transform active:scale-95"
              >
                <Link to="/shop">
                  تسوّق الآن
                  <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.8} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 rounded-full border-[#C9B9A6] bg-white/70 px-8 text-[#231F1E] hover:bg-[#EFE7DA] hover:border-[#9C6644] text-sm font-medium transition-all"
              >
                <Link to="/designer">
                  <Sparkles className="ml-2 h-4 w-4 text-[#9C6644]" strokeWidth={1.8} />
                  جرّب مصمم AI
                </Link>
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#E5DEC9] pt-6">
              {heroFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.label} className="flex items-center gap-2 text-xs sm:text-sm text-[#786C65] font-medium">
                    <Icon className="h-4 w-4 shrink-0 text-[#9C6644]" strokeWidth={1.8} />
                    {feature.label}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* الصورة الفخمة والبطاقات العائمة */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden rounded-[32px] bg-muted shadow-lg border border-[#E5DEC9]">
              <img
                src={heroImage}
                alt="مساحة معيشة دافئة بأثاث خشبي فاخر من معارض المكلا"
                className="h-[460px] lg:h-[540px] w-full object-cover rounded-[32px] transition-transform duration-700 hover:scale-[1.02]"
              />

              {/* البطاقة العائمة السفلية بدون نجوم */}
              {heroProduct && (
                <div className="absolute bottom-5 right-5 left-5 rounded-2xl border border-[#E5DEC9] bg-white/95 p-4 sm:p-5 backdrop-blur-md shadow-lg sm:left-auto sm:w-72">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#231F1E]">{heroProduct.name}</p>
                      <p className="mt-0.5 text-xs text-[#9C6644] font-medium">
                        {formatPrice(heroProduct.price)}
                      </p>
                    </div>
                    <Link
                      to={`/product/${heroProduct.slug}`}
                      aria-label="عرض القطعة"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#231F1E] text-white transition-colors hover:bg-[#9C6644]"
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
