import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StarRating } from '@/components/product/StarRating';
import { useCatalog } from '@/contexts/CatalogContext';
import { useStore } from '@/contexts/StoreContext';
import { formatPrice, getProductColorStyle, type Product } from '@/data/catalog';
import { cn } from '@/lib/utils';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { stores } = useCatalog();
  const store = stores.find(
    (item) =>
      item.id === product.storeId ||
      item.dbId === product.storeId ||
      item.legacyId === product.storeId ||
      (product.storeDbId && (item.id === product.storeDbId || item.dbId === product.storeDbId)),
  );
  const saved = isWishlisted(product.id);
  const [colorIndex, setColorIndex] = useState(0);

  const colors = product.colors ?? [];
  const activeColor = colors[colorIndex];
  const images = product.images ?? [];
  const activeImage = images[colorIndex] ?? images[0] ?? '';

  const status = !product.available
    ? { label: 'نفذت الكمية', className: 'bg-sand text-sand-foreground' }
    : product.badge?.includes('جديد')
      ? { label: 'جديد', className: 'bg-wood text-primary-foreground' }
      : product.badge && product.badge !== 'متوفر'
        ? { label: product.badge, className: 'bg-primary text-primary-foreground' }
        : { label: 'متوفر', className: 'bg-primary text-primary-foreground' };

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={activeImage}
            alt={product.name}
            loading="lazy"
            style={getProductColorStyle(activeColor?.hex)}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
          {activeColor && colorIndex > 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{ backgroundColor: activeColor.hex, opacity: 0.22, mixBlendMode: 'multiply' }}
            />
          )}
        </Link>

        <span
          className={cn(
            'absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur',
            status.className,
          )}
        >
          {status.label}
        </span>

        <button
          type="button"
          aria-label={saved ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          onClick={() => toggleWishlist(product)}
          className={cn(
            'absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors',
            saved
              ? 'bg-wood text-primary-foreground'
              : 'bg-background/90 text-foreground hover:bg-background',
          )}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-current')} strokeWidth={1.6} />
        </button>

        <button
          type="button"
          aria-label="إضافة إلى السلة"
          disabled={!product.available}
          onClick={() => addToCart(product, activeColor?.name ?? 'افتراضي')}
          className="absolute bottom-3 left-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-300 hover:bg-primary/90 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${product.slug}`}
            className="min-w-0 flex-1 text-sm font-medium leading-snug text-balance transition-opacity hover:opacity-70"
          >
            {product.name}
          </Link>
          <span className="shrink-0 text-sm">{formatPrice(product.price)}</span>
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">{store?.name ?? 'معرض إيوان'}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <StarRating rating={product.rating} reviews={product.reviews} />
          <div className="flex items-center gap-1.5">
            {colors.slice(0, 4).map((color, index) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={`اللون ${color.name}`}
                aria-pressed={index === colorIndex}
                onClick={() => setColorIndex(index)}
                className={cn(
                  'h-4 w-4 rounded-full border transition-all',
                  index === colorIndex
                    ? 'border-wood ring-2 ring-wood/30 ring-offset-1 ring-offset-background'
                    : 'border-border hover:border-wood/60',
                )}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
