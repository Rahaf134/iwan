import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';

const columns = [
  {
    title: 'تسوّق',
    links: [
      { label: 'المتجر والمنتجات', to: '/shop' },
      { label: 'المعارض والمتاجر', to: '/stores' },
      { label: 'كتالوج الإلهام', to: '/lookbook' },
      { label: 'المفضلة', to: '/wishlist' },
    ],
  },
  {
    title: 'خدماتنا',
    links: [
      { label: 'مصمم الذكاء الاصطناعي', to: '/designer' },
      { label: 'المصممون والنجارون', to: '/designers' },
      { label: 'شركاء النجاح', to: '/partners' },
    ],
  },
  {
    title: 'إيوان',
    links: [
      { label: 'آراء العملاء', to: '/reviews' },
      { label: 'الأسئلة الشائعة', to: '/faq' },
      { label: 'من نحن', to: '/about' },
      { label: 'تواصل معنا', to: '/contact' },
    ],
  },
];

export const Footer = () => (
  <footer className="border-t border-border bg-secondary">
    <div className="mx-auto w-full max-w-[1440px] px-4 py-14 md:px-8 md:py-20">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo showTagline={false} />
          <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            منصة حضرمية تجمع معارض الأثاث والمصممين والنجارين في المكلا، مع مصمم ذكاء اصطناعي
            يساعدك على ترتيب مساحتك قبل أن تشتري.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              المكلا — حضرموت، اليمن
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              <span dir="ltr">+967 5 000 100</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              <span dir="ltr">hello@ewan.ye</span>
            </p>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} إيوان — جميع الحقوق محفوظة. صُنع في المكلا، حضرموت.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="إنستغرام"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.6} />
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            تواصل معنا
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </div>
  </footer>
);
