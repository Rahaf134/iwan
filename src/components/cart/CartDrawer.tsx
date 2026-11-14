import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCatalog } from '@/contexts/CatalogContext';
import { useStore } from '@/contexts/StoreContext';
import { formatPrice } from '@/data/catalog';

export const CartDrawer = () => {
  const { products } = useCatalog();
  const { cart, cartOpen, setCartOpen, removeLine, setQuantity, subtotal, cartCount } = useStore();

  const lines = cart
    .map((line) => ({ ...line, product: products.find((item) => item.id === line.productId) }))
    .filter((line) => Boolean(line.product));

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 border-r border-border bg-background p-0 md:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5 text-right">
          <SheetTitle className="font-display text-xl font-normal">
            سلة التسوق {cartCount > 0 ? `(${cartCount})` : ''}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            توصيل وتركيب داخل المكلا — يُحسب عند إتمام الطلب.
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" strokeWidth={1.4} />
            </span>
            <div>
              <p className="font-display text-lg">سلتك فارغة</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ابدأ بقطعة ستبقى في بيتك لسنوات.
              </p>
            </div>
            <Button asChild className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Link to="/shop" onClick={() => setCartOpen(false)}>
                تصفّح المتجر
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border px-6">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-4 py-5">
                    <Link
                      to={`/product/${line.product?.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                    >
                      <img
                        src={line.product?.images[0]}
                        alt={line.product?.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{line.product?.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{line.color}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          aria-label={`حذف ${line.product?.name}`}
                          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                        <div className="flex items-center gap-1 rounded-full border border-border px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.key, line.quantity - 1)}
                            aria-label="تقليل الكمية"
                            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" strokeWidth={1.6} />
                          </button>
                          <span className="w-5 text-center text-xs font-medium">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.key, line.quantity + 1)}
                            aria-label="زيادة الكمية"
                            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" strokeWidth={1.6} />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice((line.product?.price ?? 0) * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                التوصيل والتركيب يُحسبان عند إتمام الطلب.
              </p>
              <Button asChild className="mt-4 h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/cart" onClick={() => setCartOpen(false)}>
                  إتمام الطلب
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-3 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                متابعة التسوق
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
