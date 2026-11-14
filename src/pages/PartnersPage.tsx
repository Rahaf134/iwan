import { Hammer, Lamp, Ruler, Sofa, Store, Truck } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { useCatalog } from '@/contexts/CatalogContext';

const iconMap = {
  store: Store,
  sofa: Sofa,
  hammer: Hammer,
  ruler: Ruler,
  truck: Truck,
  lamp: Lamp,
} as const;

const PartnersPage = () => {
  const { partners } = useCatalog();

  return (
    <>
      <PageMeta
        title="شركاء النجاح — إيوان المكلا"
        description="المعارض الكبرى وورش النجارة المعتمدة ومكاتب الهندسة وشركات التوصيل والتركيب في حضرموت."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <p className="eyebrow">شركاء النجاح</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            من يقف خلف كل قطعة تصل إلى بيتك
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            معارض كبرى، ورش نجارة معتمدة، مكاتب هندسية، وشركات توصيل وتركيب محلية في حضرموت —
            جميعهم موثّقون لدى منصة إيوان.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const Icon = iconMap[(partner.icon as keyof typeof iconMap) ?? 'store'] ?? Store;
            return (
              <article
                key={partner.dbId || partner.id}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <h2 className="mt-5 text-base font-medium leading-snug text-balance">{partner.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{partner.type}</p>
                <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {partner.description}
                </p>
                <span className="mt-5 inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground">
                  شريك موثّق
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PartnersPage;
