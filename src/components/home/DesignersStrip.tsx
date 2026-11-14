import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/contexts/CatalogContext';

export const DesignersStrip = () => {
  const { designers } = useCatalog();

  return (
    <section className="w-full bg-[#FAF7F2] py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[#9C6644]">المصممون والنجارون</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
              خبرة حضرمية، بتصميم معاصر
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-[#6B5E55]">
              مهندسون ونجارون وورش محلية معتمدة — من الفكرة ثلاثية الأبعاد إلى القطعة في بيتك.
            </p>
          </div>
          <Link
            to="/designers"
            className="link-underline shrink-0 self-start md:self-auto text-sm font-semibold text-[#231F1E] hover:text-[#9C6644]"
          >
            كل المصممين والورش
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {designers.slice(0, 3).map((designer) => (
            <article
              key={designer.dbId || designer.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5DEC9] bg-white shadow-xs hover:border-[#9C6644] hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={designer.imageUrl}
                  alt={designer.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-balance text-[#231F1E] group-hover:text-[#9C6644] transition-colors">
                      {designer.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#9C6644] font-medium">{designer.title}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#231F1E] bg-[#FAF7F2] px-2 py-1 rounded-md border border-[#E5DEC9]">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" strokeWidth={0} />
                    {designer.rating.toFixed(1)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#6B5E55]">
                  {designer.bio}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#F0EAE1] pt-4 text-xs text-[#786C65]">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#9C6644]" strokeWidth={1.8} />
                    {designer.area}
                  </span>
                  <span>خبرة {designer.years} سنوات</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
