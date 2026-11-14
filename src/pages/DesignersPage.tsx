import { useMemo, useState } from 'react';
import { MapPin, MessageCircle, Star } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { RequestDialog } from '@/components/common/RequestDialog';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'designer', label: 'مصممون' },
  { id: 'carpenter', label: 'نجارون وورش' },
];

const DesignersPage = () => {
  const { designers } = useCatalog();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const { openChat } = useChat();

  const filtered = useMemo(
    () => (filter === 'all' ? designers : designers.filter((item) => item.kind === filter)),
    [designers, filter],
  );

  return (
    <>
      <PageMeta
        title="المصممون والنجارون — إيوان المكلا"
        description="مصممون داخليون ونجارون وورش نجارة معتمدة في المكلا، حضرموت."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <p className="eyebrow">المصممون والنجارون</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            من يرسم الفكرة، ومن ينفّذها بيده
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            مهندسون ونجارون وورش محلية في المكلا — اطلب استشارة أو تفصيلاً خاصاً بقياسات مساحتك.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'h-10 rounded-full border px-4 text-sm transition-colors',
                filter === item.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((designer) => (
            <article
              key={designer.dbId || designer.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="flex flex-col gap-4 p-5 md:flex-row md:p-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={designer.imageUrl}
                    alt={designer.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-medium leading-snug text-balance">{designer.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{designer.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={1.6} />
                      {designer.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
                      {designer.rating.toFixed(1)}
                    </span>
                    <span>{designer.years} سنة خبرة</span>
                  </div>
                </div>
              </div>

              <p className="px-5 text-pretty text-sm leading-relaxed text-muted-foreground md:px-6">
                {designer.bio}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 px-5 md:px-6">
                {designer.portfolio.slice(0, 3).map((image, index) => (
                  <div key={`${designer.id}-${index}`} className="aspect-square overflow-hidden rounded-xl bg-muted">
                    <img
                      src={image}
                      alt={`عمل ${index + 1} — ${designer.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-auto p-5 md:p-6">
                <Button
                  onClick={() =>
                    openChat({
                      type: 'designer',
                      id: designer.id,
                      name: designer.name,
                      phone: designer.phone ?? '+967 5 000 200',
                    })
                  }
                  className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MessageCircle className="ml-2 h-4 w-4" strokeWidth={1.6} />
                  {designer.kind === 'carpenter' ? 'طلب تفصيل ومحادثة' : 'طلب استشارة ومحادثة'}
                </Button>
                <button
                  type="button"
                  onClick={() => setSelected(designer.name)}
                  className="mt-2 w-full text-center text-[11px] text-muted-foreground transition-colors hover:text-wood"
                >
                  أو أرسل طلباً مكتوباً بالتفاصيل
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <RequestDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        type="custom"
        subject={selected ?? ''}
        title={`طلب خاص — ${selected ?? ''}`}
        description="أخبرنا بالمقاسات والخامة المطلوبة، وسيصلك عرض سعر ومدة تنفيذ."
        detailsLabel="تفاصيل الطلب"
        detailsPlaceholder="مثال: خزانة حائط بطول ٣ متر وخشب زان، مع أبواب سحاب."
      />
    </>
  );
};

export default DesignersPage;
