import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { ProductCard } from '@/components/product/ProductCard';
import { StarRating } from '@/components/product/StarRating';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat } from '@/contexts/ChatContext';
import { useStore } from '@/contexts/StoreContext';
import { formatPrice } from '@/data/catalog';
import { cn } from '@/lib/utils';

const ProductPage = () => {
  const { slug } = useParams();
  const { products, stores } = useCatalog();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { openChat } = useChat();
  const [quantity, setQuantity] = useState(1);
  const [colorIndex, setColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // إعادة ضبط التحديد عند الانتقال لمنتج آخر
  useEffect(() => {
    setColorIndex(0);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [slug]);

  const product = products.find((item) => item.slug === slug);
  const store = stores.find(
    (item) => item.id === product?.storeId || item.dbId === product?.storeId || item.legacyId === product?.storeId,
  );
  const related = useMemo(
    () =>
      products
        .filter((item) => item.id !== product?.id && item.category === product?.category)
        .slice(0, 4),
    [products, product],
  );

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">لم نجد هذه القطعة</h1>
        <p className="mt-3 text-sm text-muted-foreground">ربما تم حذفها أو تغيّر رابطها.</p>
        <Button asChild className="mt-6 h-11 rounded-full bg-primary px-6 text-primary-foreground">
          <Link to="/shop">العودة إلى المتجر</Link>
        </Button>
      </div>
    );
  }

  const saved = isWishlisted(product.id);
  const colors = product.colors ?? [];
  const images = product.images ?? [];
  const color = colors[colorIndex]?.name ?? 'افتراضي';

  // تبديل صورة المنتج تلقائياً عند اختيار اللون مع الرجوع الآمن للصورة الأساسية
  const handleSelectColor = (index: number) => {
    setColorIndex(index);
    if (images[index]) {
      setSelectedImageIndex(index);
    } else {
      setSelectedImageIndex(0);
    }
  };

  // اختيار مصغر الصورة مع مطابقة اللون المقابل له
  const handleSelectThumbnail = (index: number) => {
    setSelectedImageIndex(index);
    if (colors[index]) {
      setColorIndex(index);
    }
  };

  const activeImage = images[selectedImageIndex] ?? images[0] ?? '';

  const status = !product.available
    ? { label: 'نفذت الكمية', className: 'bg-sand text-sand-foreground' }
    : product.badge?.includes('جديد')
      ? { label: 'جديد', className: 'bg-wood text-primary-foreground' }
      : { label: 'متوفر', className: 'bg-primary text-primary-foreground' };

  return (
    <>
      <PageMeta title={`${product.name} — إيوان`} description={product.description} />
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 md:pb-24">
        <nav className="flex items-center gap-2 py-5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">المتجر</Link>
          <span>/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          <div className="space-y-3">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted">
              <img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover animate-in fade-in duration-300"
              />
              <span
                className={cn(
                  'absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium',
                  status.className,
                )}
              >
                {status.label}
              </span>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectThumbnail(index)}
                    className={cn(
                      'aspect-square overflow-hidden rounded-xl border bg-muted transition-all cursor-pointer',
                      selectedImageIndex === index
                        ? 'border-wood ring-2 ring-wood/25 scale-[1.02]'
                        : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-secondary px-3.5 py-1 text-xs font-medium text-foreground">
                {product.category}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <StarRating rating={product.rating} reviews={product.reviews} />
            </div>

            <p className="mt-5 font-display text-2xl md:text-3xl">{formatPrice(product.price)}</p>

            {store && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <Link
                  to={`/stores?store=${encodeURIComponent(store.id)}`}
                  className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img src={store.imageUrl} alt={store.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-medium">
                      {store.name}
                      {store.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-wood" strokeWidth={1.8} />
                      )}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" strokeWidth={1.6} />
                      {store.city} — {store.area}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openChat({ type: 'store', id: store.id, name: store.name, phone: store.phone })
                  }
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-wood/40 px-3 text-[11px] text-wood transition-colors hover:bg-sand/40"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.6} />
                  تحدث مع المتجر
                </button>
              </div>
            )}

            <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium">
                  اللون: <span className="font-normal text-muted-foreground">{color}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {colors.map((option, index) => (
                    <button
                      key={option.name}
                      type="button"
                      aria-label={option.name}
                      aria-pressed={colorIndex === index}
                      onClick={() => handleSelectColor(index)}
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all cursor-pointer',
                        colorIndex === index
                          ? 'border-wood ring-2 ring-wood/25 scale-105 shadow-2xs'
                          : 'border-border hover:border-wood/50 hover:scale-102',
                      )}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-border shadow-xs"
                        style={{ backgroundColor: option.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border border-border">
                <button
                  type="button"
                  aria-label="تقليل"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-12 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  aria-label="زيادة"
                  onClick={() => setQuantity((value) => Math.min(9, value + 1))}
                  className="flex h-12 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>

              <Button
                disabled={!product.available}
                onClick={() => addToCart(product, color, quantity)}
                className="h-12 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingBag className="ml-2 h-4 w-4" strokeWidth={1.7} />
                {product.available ? 'أضف إلى السلة' : 'نفذت الكمية'}
              </Button>

              <Button
                variant="outline"
                aria-label="المفضلة"
                onClick={() => toggleWishlist(product)}
                className={cn(
                  'h-12 w-12 shrink-0 rounded-full border-border p-0',
                  saved && 'border-wood bg-wood text-primary-foreground hover:bg-wood/90',
                )}
              >
                <Heart className={cn('h-4 w-4', saved && 'fill-current')} strokeWidth={1.6} />
              </Button>
            </div>

            <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-muted-foreground">المقاسات</dt>
                <dd className="text-left">{product.dimensions}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-muted-foreground">الخامات</dt>
                <dd className="max-w-[60%] text-left">{product.materials.join(' · ')}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-muted-foreground">العناية</dt>
                <dd className="max-w-[60%] text-left">{product.care}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 shrink-0 text-wood" strokeWidth={1.6} />
                توصيل وتركيب داخل المكلا
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-wood" strokeWidth={1.6} />
                ضمان على التصنيع
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="font-display text-2xl text-balance md:text-3xl">قطع مشابهة</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((item) => (
                <ProductCard key={item.dbId || item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProductPage;
