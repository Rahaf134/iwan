import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/catalog';

const categorySubtitles: Record<string, string> = {
  'مطابخ': 'عصرية متكاملة',
  'كنب ومجالس': 'مريحة وفاخرة',
  'غرف نوم': 'هدوء وراحة',
  'طاولات وكراسي': 'ضيافة أنيقة',
  'إضاءة': 'أجواء دافئة',
  'وحدات تخزين': 'ترتيب متقن',
  'ديكور': 'لمسات فنية',
};

export const CategoryStrip = () => (
  <section className="w-full bg-[#EFE7DA] py-20 border-y border-[#E5DEC9]">
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
        <div className="max-w-xl">
          <p className="eyebrow text-[#9C6644]">تصفّح حسب الفئة</p>
          <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
            كل ما يحتاجه بيتك في مكان واحد
          </h2>
        </div>
        <Link
          to="/shop"
          className="link-underline shrink-0 self-start md:self-auto text-sm font-semibold text-[#231F1E] hover:text-[#9C6644]"
        >
          عرض كل الفئات
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </div>

      <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-4 lg:grid-cols-7 md:gap-6 md:overflow-visible justify-start md:justify-between">
        {categories.map((category) => {
          const subtitle = categorySubtitles[category.name] ?? 'تشكيلة مميزة';
          return (
            <Link
              key={category.name}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group flex w-32 sm:w-36 shrink-0 flex-col items-center gap-3 md:w-auto text-center transition-transform hover:-translate-y-1.5 duration-300"
            >
              <div className="w-32 h-32 md:w-36 md:h-36 overflow-hidden rounded-full transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="mt-1">
                <span className="block text-sm md:text-base font-semibold text-[#231F1E] group-hover:text-[#9C6644] transition-colors">
                  {category.name}
                </span>
                <span className="block text-[11px] text-[#786C65] font-medium mt-0.5">
                  {subtitle}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);
