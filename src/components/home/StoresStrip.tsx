import { ArrowLeft, BadgeCheck, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/contexts/CatalogContext';

export const StoresStrip = () => {
  const { stores } = useCatalog();

  return (
    <section className="w-full bg-[#EFE7DA] py-20 lg:py-24 border-y border-[#E5DEC9]">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[#9C6644]">معارض المكلا المعتمدة</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
              معارض حقيقية، يمكنك زيارتها اليوم
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-[#6B5E55]">
              ثمانية معارض موثوقة في الديس والشرج وفوة وباعبود والأربعين — لكل معرض تخصصه
              وتقييمه الحقيقي.
            </p>
          </div>
          <Link
            to="/stores"
            className="link-underline shrink-0 self-start md:self-auto text-sm font-semibold text-[#231F1E] hover:text-[#9C6644]"
          >
            دليل المعارض الكامل
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stores.slice(0, 4).map((store) => (
            <Link
              key={store.dbId || store.id}
              to={`/stores?store=${encodeURIComponent(store.id)}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5DEC9] bg-white shadow-xs hover:border-[#9C6644] hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={store.imageUrl}
                  alt={store.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-balance text-[#231F1E] group-hover:text-[#9C6644] transition-colors">
                    {store.name}
                  </h3>
                  {store.verified && (
                    <BadgeCheck className="h-4 w-4 shrink-0 text-[#9C6644]" strokeWidth={2} />
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6B5E55] line-clamp-2">
                  {store.specialty}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-[#F0EAE1] pt-4 text-xs text-[#786C65]">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#9C6644]" strokeWidth={1.8} />
                    {store.area} · المكلا
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#231F1E]">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" strokeWidth={0} />
                    {store.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
