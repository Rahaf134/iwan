import { ArrowLeft, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/contexts/CatalogContext';

export const TestimonialsSection = () => {
  const { reviews } = useCatalog();
  const approved = reviews.filter((review) => review.approved).slice(0, 3);

  return (
    <section className="w-full bg-[#FAF7F2] py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[#9C6644]">آراء العملاء</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
              تجارب حقيقية من منازل عملائنا
            </h2>
            <p className="mt-2 text-sm text-[#6B5E55]">
              آراء حقيقية من أهالي المكلا ممن قاموا بتأثيث منازلهم عبر منصة إيوان.
            </p>
          </div>
          <Link
            to="/reviews"
            className="link-underline shrink-0 self-start md:self-auto text-sm font-semibold text-[#231F1E] hover:text-[#9C6644]"
          >
            عرض كل الآراء والتقييمات
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {approved.map((review) => {
            const firstLetter = review.name ? review.name.trim().charAt(0) : 'ع';
            return (
              <figure
                key={review.dbId || review.id}
                className="flex h-full flex-col rounded-3xl border border-[#E5DEC9] bg-[#EFE7DA] p-7 shadow-xs hover:border-[#9C6644] hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Quote className="h-7 w-7 text-[#9C6644]/70" strokeWidth={1.5} />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? 'fill-[#9C6644] text-[#9C6644]'
                            : 'text-[#C9B9A6]'
                        }`}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                </div>

                <blockquote className="flex-1 text-pretty text-sm sm:text-base leading-relaxed text-[#231F1E] font-normal">
                  «{review.text}»
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#D8CCBA] pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9C6644] text-white font-bold text-sm shadow-xs">
                    {firstLetter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#231F1E]">{review.name}</p>
                    <p className="truncate text-xs text-[#786C65]">
                      {review.area ? `${review.area} · ` : ''}
                      <span className="text-[#9C6644] font-medium">{review.service || 'عميل موثق'}</span>
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};
