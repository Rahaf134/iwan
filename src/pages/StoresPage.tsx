import { useMemo, useState } from 'react';
import { BadgeCheck, MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat } from '@/contexts/ChatContext';
import { areas } from '@/data/catalog';
import { cn } from '@/lib/utils';

const StoresPage = () => {
  const { stores } = useCatalog();
  const { openChat } = useChat();
  const [area, setArea] = useState('all');

  const filtered = useMemo(
    () => (area === 'all' ? stores : stores.filter((store) => store.area === area)),
    [stores, area],
  );


  return (
    <>
      <PageMeta
        title="المعارض والمتاجر — إيوان المكلا"
        description="دليل معارض الأثاث والديكور في المكلا: الديس، الشرج، فوة، باعبود، الأربعين."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <p className="eyebrow">دليل المعارض</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            معارض المكلا الموثوقة
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            معارض حقيقية في أحياء المكلا، لكل منها تخصصه وتقييمه. تصفّح منتجات المعرض أو
            تواصل معه مباشرة.
          </p>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setArea('all')}
            className={cn(
              'h-10 shrink-0 rounded-full border px-4 text-sm transition-colors',
              area === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            كل الأحياء
          </button>
          {areas.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setArea(item)}
              className={cn(
                'h-10 shrink-0 rounded-full border px-4 text-sm transition-colors',
                area === item
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((store) => (
            <article
              key={store.dbId || store.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src={store.imageUrl}
                  alt={store.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-medium leading-snug text-balance">{store.name}</h2>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                      {store.city} — {store.area}
                    </p>
                  </div>
                  {store.verified && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-foreground">
                      <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
                      موثّق
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{store.specialty}</p>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {store.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
                    {store.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1" dir="ltr">
                    <Phone className="h-3 w-3" strokeWidth={1.6} />
                    {store.phone}
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-5 md:flex-row">
                  <Button
                    asChild
                    className="h-11 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link to={`/shop?store=${encodeURIComponent(store.id)}`}>تصفح منتجات المعرض</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      openChat({ type: 'store', id: store.id, name: store.name, phone: store.phone })
                    }
                    className="h-11 flex-1 rounded-full border-border"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" strokeWidth={1.6} />
                    محادثة المعرض
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <p className="font-display text-xl">لا توجد معارض في هذا الحي</p>
            <p className="mt-2 text-sm text-muted-foreground">جرّب حياً آخر أو اعرض كل المعارض.</p>
            <Button
              variant="outline"
              onClick={() => setArea('all')}
              className="mt-5 h-11 rounded-full border-border px-6"
            >
              عرض كل المعارض
            </Button>
          </div>
        )}
      </div>

    </>
  );
};

export default StoresPage;
