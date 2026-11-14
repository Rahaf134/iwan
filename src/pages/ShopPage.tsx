import { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCatalog } from '@/contexts/CatalogContext';
import { categories, formatPrice } from '@/data/catalog';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'featured', label: 'المميزة أولاً' },
  { value: 'price-asc', label: 'السعر: من الأقل' },
  { value: 'price-desc', label: 'السعر: من الأعلى' },
  { value: 'rating', label: 'الأعلى تقييماً' },
];

const ShopPage = () => {
  const { products, stores } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = params.get('category') ?? 'all';
  const activeStore = params.get('store') ?? 'all';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const targetStore = stores.find(
        (s) => s.id === activeStore || s.dbId === activeStore || s.legacyId === activeStore,
      );
      const matchesStore =
        activeStore === 'all' ||
        product.storeId === activeStore ||
        product.storeDbId === activeStore ||
        (targetStore && (targetStore.id === product.storeId || targetStore.legacyId === product.storeId));
      const matchesPrice = product.price <= maxPrice;
      return matchesCategory && matchesStore && matchesPrice;
    });

    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, activeCategory, activeStore, maxPrice, sort]);

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setMaxPrice(1500000);
    setSort('featured');
  };

  const filterBody = (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium">الفئة</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParam('category', 'all')}
            className={cn(
              'h-9 rounded-full border px-3 text-xs transition-colors',
              activeCategory === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            الكل
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setParam('category', category.name)}
              className={cn(
                'h-9 rounded-full border px-3 text-xs transition-colors',
                activeCategory === category.name
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">المعرض</p>
        <div className="mt-3 space-y-1.5">
          <button
            type="button"
            onClick={() => setParam('store', 'all')}
            className={cn(
              'block w-full rounded-xl px-3 py-2 text-right text-xs transition-colors',
              activeStore === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            كل المعارض
          </button>
          {stores.map((store) => (
            <button
              key={store.dbId || store.id}
              type="button"
              onClick={() => setParam('store', store.id)}
              className={cn(
                'block w-full rounded-xl px-3 py-2 text-right text-xs transition-colors',
                activeStore === store.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">أقصى سعر</p>
          <span className="text-xs text-muted-foreground">{formatPrice(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={40000}
          max={1500000}
          step={10000}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          aria-label="أقصى سعر"
          className="mt-3 w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <Button
        variant="outline"
        onClick={reset}
        className="h-10 w-full rounded-full border-border"
      >
        إعادة تعيين الفلاتر
      </Button>
    </div>
  );

  return (
    <>
      <PageMeta
        title="المتجر والمنتجات — إيوان المكلا"
        description="تصفح منتجات الأثاث والديكور من معارض المكلا بأسعار الريال اليمني."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-14">
          <p className="eyebrow">المتجر والمنتجات</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            قطع حقيقية من معارض المكلا
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            قطع مختارة بأسعار الريال اليمني، مع اسم المعرض والمقاسات والخامات لكل قطعة.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-border px-4 md:hidden">
                  <SlidersHorizontal className="ml-2 h-4 w-4" strokeWidth={1.6} />
                  الفلاتر
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86%] max-w-xs overflow-y-auto border-l border-border bg-background p-6">
                <SheetTitle className="mb-6 text-right font-display text-xl">الفلاتر</SheetTitle>
                {filterBody}
              </SheetContent>
            </Sheet>
            <p className="text-xs text-muted-foreground">{filtered.length} نتيجة</p>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-44 rounded-full border-border bg-background px-4 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[240px_1fr] md:gap-10">
          <aside className="hidden md:block">
            <div className="sticky top-28">{filterBody}</div>
          </aside>

          <div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {filtered.map((product) => (
                  <ProductCard key={product.dbId || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
                <p className="font-display text-xl">لا توجد نتائج مطابقة</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  جرّب فئة أخرى أو ارفع حد السعر.
                </p>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="mt-5 h-11 rounded-full border-border px-6"
                >
                  <X className="ml-2 h-4 w-4" strokeWidth={1.6} />
                  إعادة تعيين
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
