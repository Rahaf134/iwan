import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { useCatalog } from '@/contexts/CatalogContext';

export const FeaturedPieces = () => {
  const { products } = useCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const pieces = featured.length > 0 ? featured : products.slice(0, 8);

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

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 @md:grid-cols-3 @md:gap-x-6 @lg:grid-cols-4 @lg:gap-y-12">
          {pieces.map((product) => (
            <ProductCard key={product.dbId || product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
