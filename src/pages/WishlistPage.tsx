import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { useStore } from '@/contexts/StoreContext';

const WishlistPage = () => {
  const { wishlist } = useStore();
  const { products } = useCatalog();

  const saved = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist],
  );

  return (
    <>
      <PageMeta title="المفضلة — إيوان" description="القطع التي حفظتها من معارض المكلا." />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-14">
          <p className="eyebrow">المفضلة</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-balance md:text-5xl">
            قطعك المحفوظة
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{saved.length} قطعة في قائمتك</p>
        </div>

        {saved.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-border bg-card px-6 py-20 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.4} />
            <p className="mt-4 font-display text-xl">لم تحفظ أي قطعة بعد</p>
            <p className="mt-2 text-sm text-muted-foreground">
              اضغط على القلب في أي بطاقة منتج لحفظها هنا.
            </p>
            <Button asChild className="mt-6 h-11 rounded-full bg-primary px-6 text-primary-foreground">
              <Link to="/shop">تصفّح المتجر</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {saved.map((product) => (
              <ProductCard key={product.dbId || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
