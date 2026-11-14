import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { useCatalog } from '@/contexts/CatalogContext';

export const FeaturedPieces = () => {
  const { products } = useCatalog();

  const pieces = useMemo(() => {
    // الترتيب الدقيق للقطع الـ 8 الأصلية بالاسم والـ slug من ملف النسخة الاحتياطية
    const targetOrder = [
      'marble-coffee-tables',     // 1. طاولة القهوة الرخامية المتداخلة بقاعدة خشبية
      'hadrami-floor-majlis',     // 2. الجلسة العربية / المجلس الأرضي البيج الفاخر مع الوسائد
      'boucle-lounge-chair',      // 3. الكرسي المفرد البوكليه الكريمي الدائري
      'master-bedroom-set',       // 4. السرير الخشبي المزدوج الفاخر مع الكومودينو واللوحة الجدارية
      'walnut-round-dining-table',// 5. طاولة الطعام الدائرية الخشبية مع الكراسي القماشية البيج
      'linen-corner-sofa',        // 6. الكنب المودرن الكريمي المتصل
      'oak-kitchen-island',       // 7. مطبخ خشب السنديان العصري مع الجزيرة
      'minimal-tv-unit',          // 8. وحدة تلفزيون معلقة بتصميم مينيملست خشب وأبيض
    ];

    const sorted: typeof products = [];

    // جلب القطع حسب الترتيب الدقيق المحدد
    targetOrder.forEach((slug) => {
      const match = products.find(
        (p) =>
          (p.slug === slug ||
            (slug === 'marble-coffee-tables' && (p.name.includes('قهوة متداخلة') || p.name.includes('رخامي أبيض'))) ||
            (slug === 'hadrami-floor-majlis' && (p.name.includes('مجلس عربي') || p.name.includes('أرضي فاخر'))) ||
            (slug === 'boucle-lounge-chair' && (p.name.includes('بوكليه') || p.name.includes('كرسي استرخاء'))) ||
            (slug === 'master-bedroom-set' && (p.name.includes('غرفة نوم') || p.name.includes('ماستر مودرن'))) ||
            (slug === 'walnut-round-dining-table' && (p.name.includes('طاولة طعام') || p.name.includes('دائرية خشب'))) ||
            (slug === 'linen-corner-sofa' && (p.name.includes('طقم كنب') || p.name.includes('كنب زاوية'))) ||
            (slug === 'oak-kitchen-island' && (p.name.includes('مطبخ خشب سنديان') || p.name.includes('بجزيرة وسطية'))) ||
            (slug === 'minimal-tv-unit' && (p.name.includes('تلفزيون') || p.name.includes('مينيملست')))) &&
          !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id))
      );
      if (match) sorted.push(match);
    });

    // استبعاد القطع المحظورة (طاولة الكراسي الخضراء وبنش السرير المعطوب)
    const isExcluded = (p: { slug?: string; name?: string }) =>
      p.slug === 'solid-oak-dining-table' ||
      p.slug === 'boucle-bed-bench' ||
      (p.name && (p.name.includes('8 أشخاص') || p.name.includes('بنش مقعد')));

    // استكمال من القطع المميزة إن لم تكتمل
    if (sorted.length < 8) {
      const featured = products.filter((p) => p.featured && !isExcluded(p));
      featured.forEach((p) => {
        if (sorted.length < 8 && !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id))) {
          sorted.push(p);
        }
      });
    }

    // استكمال من باقي المنتجات
    if (sorted.length < 8) {
      products.forEach((p) => {
        if (isExcluded(p)) return;
        if (sorted.length < 8 && !sorted.some((s) => (s.dbId && s.dbId === p.dbId) || (s.id && s.id === p.id))) {
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
