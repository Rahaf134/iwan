import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { useCatalog } from '@/contexts/CatalogContext';

export const FeaturedPieces = () => {
  const { products } = useCatalog();

  const pieces = useMemo(() => {
    // 1. استبعاد تام لأي قطعة محظورة (طاولة الكراسي الخضراء وبنش السرير المعطوب)
    const isExcluded = (p: { slug?: string; name?: string }) =>
      p.slug === 'solid-oak-dining-table' ||
      p.slug === 'boucle-bed-bench' ||
      Boolean(p.name && (p.name.includes('8 أشخاص') || p.name.includes('بنش مقعد')));

    // 2. معايير المطابقة الدقيقة للقطع الـ 8 الأصلية
    const targetMatchers = [
      {
        slug: 'marble-coffee-tables',
        match: (p: (typeof products)[0]) =>
          p.slug === 'marble-coffee-tables' ||
          p.name.includes('متداخلة سطح رخامي') ||
          (p.name.includes('قهوة') && p.name.includes('رخام')),
      },
      {
        slug: 'hadrami-floor-majlis',
        match: (p: (typeof products)[0]) =>
          p.slug === 'hadrami-floor-majlis' ||
          p.name.includes('مجلس عربي أرضي') ||
          p.name.includes('بتطريز حضرمي'),
      },
      {
        slug: 'boucle-lounge-chair',
        match: (p: (typeof products)[0]) =>
          p.slug === 'boucle-lounge-chair' ||
          p.name.includes('كرسي استرخاء مفرد') ||
          (p.name.includes('كرسي') && p.name.includes('بوكليه')),
      },
      {
        slug: 'master-bedroom-set',
        match: (p: (typeof products)[0]) =>
          p.slug === 'master-bedroom-set' || p.name.includes('غرفة نوم ماستر'),
      },
      {
        slug: 'walnut-round-dining-table',
        match: (p: (typeof products)[0]) =>
          p.slug === 'walnut-round-dining-table' ||
          p.name.includes('دائرية خشب جوز') ||
          p.name.includes('طاولة طعام دائرية'),
      },
      {
        slug: 'linen-corner-sofa',
        match: (p: (typeof products)[0]) =>
          p.slug === 'linen-corner-sofa' || p.name.includes('طقم كنب زاوية'),
      },
      {
        slug: 'oak-kitchen-island',
        match: (p: (typeof products)[0]) =>
          p.slug === 'oak-kitchen-island' ||
          (p.name.includes('مطبخ خشب سنديان') && p.name.includes('بجزيرة')),
      },
      {
        slug: 'minimal-tv-unit',
        match: (p: (typeof products)[0]) =>
          p.slug === 'minimal-tv-unit' || p.name.includes('وحدة تلفزيون معلقة'),
      },
    ];

    const sorted: typeof products = [];

    // مطابقة واختيار القطع الـ 8 بالتسلسل المباشر
    targetMatchers.forEach(({ match }) => {
      const found = products.find(
        (p) =>
          !isExcluded(p) &&
          match(p) &&
          !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id)),
      );
      if (found) sorted.push(found);
    });

    // استكمال من القطع المميزة غير المحظورة في حال وجود نقص
    if (sorted.length < 8) {
      const featured = products.filter((p) => p.featured && !isExcluded(p));
      featured.forEach((p) => {
        if (
          sorted.length < 8 &&
          !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id))
        ) {
          sorted.push(p);
        }
      });
    }

    // استكمال من باقي المنتجات غير المحظورة في حال النقص
    if (sorted.length < 8) {
      products.forEach((p) => {
        if (isExcluded(p)) return;
        if (
          sorted.length < 8 &&
          !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id))
        ) {
          sorted.push(p);
        }
      });
    }

    return sorted.slice(0, 8);
  }, [products]);

  return (
    <section className="w-full bg-[#FAF7F2] py-20 lg:py-24">
      <div className="@container mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[#9C6644]">قطع مختارة</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
              القطع التي يعود إليها عملاؤنا
            </h2>
            <p className="mt-2 text-sm text-[#6B5E55]">
              تشكيلة منتقاة بعناية من أفضل معارض المكلا بأسعار الريال اليمني المباشرة.
            </p>
          </div>
          <Link
            to="/shop"
            className="link-underline shrink-0 self-start md:self-auto text-sm font-semibold text-[#231F1E] hover:text-[#9C6644]"
          >
            عرض كل القطع
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 @md:grid-cols-3 @md:gap-x-6 @lg:grid-cols-4 @lg:gap-y-14">
          {pieces.map((product) => (
            <ProductCard key={product.dbId || product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
