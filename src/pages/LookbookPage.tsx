import { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCatalog } from '@/contexts/CatalogContext';
import { lookbookPieces, type LookbookItem } from '@/data/catalog';

const LookbookPage = () => {
  const { products, stores, lookbookItems } = useCatalog();
  const [active, setActive] = useState<LookbookItem | null>(null);

  return (
    <>
      <PageMeta
        title="كتالوج الإلهام — إيوان"
        description="مساحات ملهمة من بيوت حضرموت بأثاث من معارض المكلا."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-14">
          <p className="eyebrow">كتالوج الإلهام</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            مساحات حقيقية من بيوت حضرموت
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            تصفّح مساحات منفّذة بأثاث معارض المكلا، واستلهم التوزيع والألوان قبل أن تبدأ.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {lookbookItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className={
                index % 5 === 0
                  ? 'group relative col-span-2 overflow-hidden rounded-2xl bg-muted text-right'
                  : 'group relative overflow-hidden rounded-2xl bg-muted text-right'
              }
            >
              <div className={index % 5 === 0 ? 'aspect-[16/10] w-full' : 'aspect-[4/5] w-full'}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-white/75">{item.area}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-border bg-[#FAF7F2] p-0 sm:rounded-3xl md:max-w-2xl [&>button]:z-20 [&>button]:rounded-full [&>button]:bg-black/40 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-90 hover:[&>button]:bg-black/60 hover:[&>button]:opacity-100">
          {active && (
            <div className="flex flex-col">
              {/* الجزء العلوي: الصورة فقط بارتفاع محدد ونظيف */}
              <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden rounded-t-3xl bg-muted">
                <img src={active.image} alt={active.title} className="h-full w-full object-cover" />
              </div>

              {/* الجزء السفلي: صندوق نصي مستقل تماماً تحت الصورة بخلفية #FAF7F2 وحشوة داخلية p-6 sm:p-8 */}
              <div className="bg-[#FAF7F2] p-6 sm:p-8 text-right">
                <DialogHeader className="text-right sm:text-right space-y-1">
                  <DialogTitle className="font-display text-2xl font-bold text-foreground text-right">
                    {active.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground text-right">
                    {active.area} · {active.style}
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-4 mb-6 border-b border-border pb-4 text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground text-right">
                  {active.description}
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground">القطع والمتاجر المنفذة لهذا الإلهام</p>
                  <ul className="mt-4 space-y-2.5">
                    {(lookbookPieces[active.id] ?? []).map((piece) => {
                      const product = products.find(
                        (item) => item.id === piece.productId || item.legacyId === piece.productId || item.dbId === piece.productId,
                      );
                      const store = stores.find(
                        (item) => item.id === piece.storeId || item.legacyId === piece.storeId || item.dbId === piece.storeId,
                      );
                      if (!product) return null;
                      return (
                        <li
                          key={`${active.id}-${piece.productId}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs sm:text-sm font-medium text-foreground">{product.name}</p>
                            <p className="mt-0.5 text-xs text-wood">{store?.name ?? 'معرض إيوان'}</p>
                          </div>
                          <Link
                            to={`/product/${product.slug}`}
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-wood/40 px-3 py-1.5 text-xs text-wood transition-colors hover:bg-sand/40 font-medium"
                          >
                            اطلب القطعة
                            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LookbookPage;
