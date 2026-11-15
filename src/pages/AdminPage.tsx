import { useState, useMemo } from 'react';
import {
  Hammer,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { DesignerManager } from '@/components/admin/DesignerManager';
import { FaqManager } from '@/components/admin/FaqManager';
import { LookbookManager } from '@/components/admin/LookbookManager';
import { PartnerManager } from '@/components/admin/PartnerManager';
import { ProductManager } from '@/components/admin/ProductManager';
import { RequestManager } from '@/components/admin/RequestManager';
import { ReviewManager } from '@/components/admin/ReviewManager';
import { StoreManager } from '@/components/admin/StoreManager';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { formatPrice } from '@/data/catalog';
import { parseOrderDetails } from '@/lib/order';
import { cn } from '@/lib/utils';

const adminTabs = [
  { id: 'stores', label: 'المعارض', icon: Store },
  { id: 'products', label: 'المنتجات والمعروضات', icon: Package },
  { id: 'designers', label: 'المصممون', icon: Hammer },
  { id: 'lookbook', label: 'كتالوج الإلهام', icon: Sparkles },
  { id: 'partners', label: 'الشركاء', icon: Users },
  { id: 'reviews', label: 'الآراء', icon: MessageSquareQuote },
  { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { id: 'requests', label: 'الطلبات الواردة', icon: Inbox },
];

const AdminPage = () => {
  const { profile, isAdmin, isProvider, signOut } = useAuth();
  const [tab, setTab] = useState('stores');
  const { products, stores, designers, requests, reviews } = useCatalog();

  // إذا حاول مزود الدخول لمسار الآدمن، نوجهه تلقائياً للوحته الخاصة
  if (isProvider && !isAdmin) {
    return <Navigate to="/provider" replace />;
  }

  const newRequestsCount = requests.filter((r) => r.status === 'new').length;
  const tabs = adminTabs;
  const currentTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  // احتساب إجمالي عمولة المنصة (4%) لكافة الطلبات
  const totalPlatformCommission = useMemo(() => {
    let sum = 0;
    requests.forEach((r) => {
      if (r.type === 'chat_message' || r.type === 'lookbook_item') return;
      const order = parseOrderDetails(r.details, r.phone, r.name);
      if (order && order.price && order.price > 0) {
        sum += Math.round(order.price * (order.quantity || 1) * 0.04);
      }
    });
    return sum;
  }, [requests]);

  const stats = [
    { label: 'أرباح المنصة (4%)', value: formatPrice(totalPlatformCommission) },
    { label: 'المنتجات', value: products.length },
    { label: 'المعارض', value: stores.length },
    { label: 'المصممون', value: designers.length },
    { label: 'الطلبات الجديدة', value: newRequestsCount },
  ];

  return (
    <>
      <PageMeta
        title={isProvider && !isAdmin ? 'بوابة المزود — إيوان' : 'لوحة التحكم والإشراف — إيوان'}
        description="إدارة المنتجات والطلبات والمحادثات."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        {/* ترويسة الصفحة */}
        <div className="border-b border-border py-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              {isProvider && !isAdmin && (
                <div className="mb-2">
                  <p className="eyebrow">بوابة المزود المعتمد</p>
                </div>
              )}

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight text-balance text-[#231F1E]">
                {profile?.businessName || profile?.fullName || 'إدارة منصة إيوان'}
              </h1>

              <p className="mt-2 text-pretty text-xs sm:text-sm text-muted-foreground">
                {isProvider && !isAdmin
                  ? `أهلاً بك ${profile?.fullName || ''} — يمكنك إدارة منتجاتك، متابعة طلبات عملائك، والرد الفوري على المحادثات.`
                  : `مرحباً ${profile?.fullName || 'رحاف'} — دور الآدمن يتيح الإشراف العام، مراجعة المعارض واعتمادها، ومتابعة نشاط المنصة.`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isProvider && !isAdmin && (
                <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-[#FAF7F2] text-[#9C6644] border border-[#E5DEC9]">
                  {profile?.specialty || 'مزود معتمد'}
                </span>
              )}
              <Button asChild variant="outline" className="h-10 rounded-full border-border px-4">
                <Link to="/">
                  <LayoutDashboard className="ml-2 h-4 w-4" strokeWidth={1.6} />
                  الموقع
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => void signOut()}
                className="h-10 rounded-full text-xs text-muted-foreground hover:text-rose-600"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>

          {/* إحصائيات عامة */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-2xs">
                <p className="text-xl md:text-2xl font-medium text-stone-800">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* أشرطة التبويب */}
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isTabActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  isTabActive
                    ? 'border-[#231F1E] bg-[#231F1E] text-white shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* محتوى التبويبات */}
        <div className="mt-8">
          {currentTab === 'stores' && <StoreManager />}
          {currentTab === 'products' && <ProductManager />}
          {currentTab === 'designers' && <DesignerManager />}
          {currentTab === 'lookbook' && <LookbookManager />}
          {currentTab === 'partners' && <PartnerManager />}
          {currentTab === 'reviews' && <ReviewManager />}
          {currentTab === 'faqs' && <FaqManager />}
          {currentTab === 'requests' && <RequestManager />}
        </div>
      </div>
    </>
  );
};

export default AdminPage;
