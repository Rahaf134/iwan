import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCatalog } from '@/contexts/CatalogContext';
import { useStore } from '@/contexts/StoreContext';
import { formatPrice } from '@/data/catalog';

const suggestions = ['مطبخ سنديان', 'طقم كنب', 'غرفة نوم', 'طاولة طعام', 'إضاءة نحاسية'];

export const SearchDialog = () => {
  const { products, stores } = useCatalog();
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 4);
    return products
      .filter((product) => {
        const store = stores.find((item) => item.id === product.storeId);
        return [product.name, product.category, store?.name ?? '', ...product.materials]
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
      .slice(0, 6);
  }, [query, products, stores]);

  const goToProduct = (slug: string) => {
    setSearchOpen(false);
    setQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl border-border bg-background p-0 sm:rounded-3xl md:max-w-xl">
        <DialogTitle className="sr-only">البحث في المتجر</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border py-4 pl-12 pr-5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن كنبة، طاولة، إضاءة…"
            className="h-9 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-3">
          {!query ? (
            <div className="px-3 pb-2">
              <p className="eyebrow mb-2">بحث شائع</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة لـ «{query}»
            </p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.dbId || product.id}>
                  <button
                    type="button"
                    onClick={() => goToProduct(product.slug)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-colors hover:bg-secondary"
                  >
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {product.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
