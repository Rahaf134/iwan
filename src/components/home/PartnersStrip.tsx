import { Hammer, Ruler, Sofa, Store, Truck, Wrench } from 'lucide-react';
import { useCatalog } from '@/contexts/CatalogContext';

const iconMap = {
  store: Store,
  sofa: Sofa,
  hammer: Hammer,
  ruler: Ruler,
  truck: Truck,
  wrench: Wrench,
} as const;

export const PartnersStrip = () => {
  const { partners } = useCatalog();

  return (
    <section className="w-full bg-[#EFE7DA] py-20 border-y border-[#E5DEC9]">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[#9C6644]">شركاء النجاح</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-balance md:text-4xl text-[#231F1E]">
              شبكة محلية موثوقة تعمل معك من البداية للنهاية
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-[#6B5E55]">
            معارض كبرى، ورش نجارة معتمدة، مكاتب هندسية، وشركات توصيل وتركيب داخل حضرموت.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const Icon = iconMap[(partner.icon as keyof typeof iconMap) ?? 'store'] ?? Store;
            return (
              <div
                key={partner.dbId || partner.id}
                className="flex items-start gap-4 rounded-2xl border border-[#E5DEC9] bg-white/70 p-6 shadow-xs hover:border-[#9C6644] hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-[#9C6644] shadow-2xs">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#231F1E] leading-snug">
                    {partner.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#9C6644]">{partner.type}</p>
                  {partner.description && (
                    <p className="mt-2 text-xs text-[#786C65] leading-relaxed line-clamp-2">
                      {partner.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
