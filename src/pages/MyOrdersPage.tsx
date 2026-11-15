import { useState, useMemo } from 'react';
import {
  PackageCheck,
  Truck,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Star,
  MapPin,
  ArrowLeft,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { RatingModal } from '@/components/common/RatingModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { formatPrice } from '@/data/catalog';
import { parseOrderDetails } from '@/lib/order';
import { cn } from '@/lib/utils';

const trackerSteps = [
  { step: 1, label: 'تم تأكيد الطلب', desc: 'سُجل الطلب في المنصة' },
  { step: 2, label: 'قيد التجهيز بالمعرض', desc: 'تجهيز ومراجعة القطع' },
  { step: 3, label: 'خرج للتوصيل', desc: 'طلبك في الطريق إليك مع مندوب التوصيل' },
  { step: 4, label: 'تم التسليم', desc: 'المعاينة والاستلام' },
];

// دالة توليد كود رسمي أنيق ومختصر مثل #EW-8492
const formatOrderCode = (rawCode?: string, id?: string): string => {
  if (rawCode && rawCode.trim().length > 0 && rawCode.trim().length <= 9 && !rawCode.includes('-')) {
    return `#EW-${rawCode.trim().toUpperCase()}`;
  }
  const clean = (rawCode || id || '8492').replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-4).toUpperCase() || '8492';
  return `#EW-${suffix}`;
};

export const MyOrdersPage = () => {
  const { requests } = useCatalog();
  const { profile, user } = useAuth();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStoreForRating, setSelectedStoreForRating] = useState<string>('');

  // استخراج طلبات العميل الخاص بالحساب المسجل حالياً فقط مع ترتيبها الأحدث أولاً
  const myOrders = useMemo(() => {
    if (!profile && !user) return [];
    
    // 1. تجميع كافة المصادر المتاحة للطلبات (سواء كانت من Supabase أو المخزنة محلياً)
    const localUserOrders: any[] = [];
    try {
      const stored = localStorage.getItem('ewan_user_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localUserOrders.push(...parsed);
      }
    } catch {
      // ignore
    }

    const allSources = [...localUserOrders];
    for (const r of requests) {
      if (
        r.type === 'order' &&
        !allSources.some((o) => (o.dbId && o.dbId === r.dbId) || (o.id && o.id === r.id))
      ) {
        allSources.push(r);
      }
    }

    const storedStatuses: Record<string, string> = (() => {
      try {
        const raw = localStorage.getItem('ewan_order_statuses');
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();

    // منع تكرار الطلبات واستخراج الحالة الدائمة
    const seenIds = new Set<string>();
    const seenFps = new Set<string>();
    const deduplicatedSources: any[] = [];

    for (const r of allSources) {
      const idKey = r.dbId || r.id;
      const details = parseOrderDetails(r.details, r.phone, r.name);
      const client = (details.customerName || r.name || '').trim().toLowerCase();
      const prod = (details.productName || '').trim().toLowerCase();
      const price = details.price || 0;
      const fp = `${client}|${prod}|${price}`;

      if (idKey && seenIds.has(idKey)) continue;
      if (seenFps.has(fp)) continue;

      if (idKey) seenIds.add(idKey);
      seenFps.add(fp);

      const persistentStatus =
        (r.dbId && storedStatuses[r.dbId]) ||
        (r.id && storedStatuses[r.id]) ||
        r.status ||
        'new';

      deduplicatedSources.push({
        ...r,
        status: persistentStatus,
      });
    }

    const userEmail = (profile?.email || user?.email || '').trim().toLowerCase();
    const userId = profile?.id || user?.id;
    const userPhoneClean = (profile?.phone || '').replace(/\D/g, '');
    const userName = (profile?.fullName || '').trim().toLowerCase();

    const filtered = deduplicatedSources.filter((r) => {
      const details = parseOrderDetails(r.details, r.phone, r.name);

      // 1. مطابقة معرف العميل
      if (userId && details.userId && details.userId === userId) {
        return true;
      }
      // 2. مطابقة البريد الإلكتروني للعميل
      if (userEmail && details.customerEmail && details.customerEmail.trim().toLowerCase() === userEmail) {
        return true;
      }
      // 3. مطابقة رقم الهاتف المسجل
      const orderPhoneClean = (details.phone || r.phone || '').replace(/\D/g, '');
      if (
        userPhoneClean.length >= 7 &&
        orderPhoneClean.length >= 7 &&
        (orderPhoneClean === userPhoneClean ||
          orderPhoneClean.endsWith(userPhoneClean) ||
          userPhoneClean.endsWith(orderPhoneClean))
      ) {
        return true;
      }
      // 4. مطابقة الاسم الكامل للعميل
      const orderCustomerName = (details.customerName || r.name || '').trim().toLowerCase();
      if (
        userName &&
        userName.length >= 4 &&
        orderCustomerName &&
        (orderCustomerName === userName || orderCustomerName.includes(userName))
      ) {
        return true;
      }

      return false;
    });

    // ترتيب الطلبات دائماً تنازلياً حسب الأحدث (Newest First)
    return filtered.sort((a, b) => {
      const detailsA = parseOrderDetails(a.details, a.phone, a.name);
      const detailsB = parseOrderDetails(b.details, b.phone, b.name);
      const timeA = new Date(detailsA.date || a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(detailsB.date || b.createdAt || b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [requests, profile, user]);

  // تحديد أحدث طلب قيد التنفيذ لإبراز بطاقة تنبيه التتبع الحي
  const activeOrder = useMemo(() => {
    if (myOrders.length === 0) return null;
    const inProgress = myOrders.find((o) => o.status !== 'done' && o.status !== 'delivered');
    return inProgress || myOrders[0];
  }, [myOrders]);

  const getStepIndex = (status: string): number => {
    switch (status) {
      case 'new':
      case 'confirmed':
        return 1;
      case 'processing':
      case 'contacted':
        return 2;
      case 'shipping':
      case 'in_progress':
        return 3;
      case 'done':
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const handleOpenRating = (storeName: string) => {
    setSelectedStoreForRating(storeName);
    setRatingModalOpen(true);
  };

  // إذا لم يكن المستخدم مسجلاً للدخول، عرض بطاقة أنيقة تطالبه بالدخول
  if (!profile && !user) {
    return (
      <>
        <PageMeta
          title="طلباتي وتتبع الشحنات — إيوان"
          description="متابعة مراحل تجهيز وتوصيل طلبات الأثاث في المكلا والتقييم المعتمد بعد الاستلام."
        />
        <div className="min-h-screen bg-[#FAF7F2] py-16 md:py-24">
          <div className="mx-auto w-full max-w-lg px-4 text-center">
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-8 sm:p-10 shadow-lg text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9C6644]/10 text-[#9C6644] border border-[#9C6644]/20">
                <PackageCheck className="h-8 w-8" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#231F1E] mb-2">
                طلباتي وتتبع الشحنات
              </h2>
              <p className="text-xs sm:text-sm text-[#786C65] leading-relaxed mb-6">
                يرجى تسجيل الدخول إلى حسابك أولاً لعرض طلباتك وتتبع خط سير الشحنات في المكلا خطوة بخطوة.
              </p>
              <Button
                asChild
                className="h-11 rounded-full bg-[#231F1E] px-8 text-white hover:bg-[#9C6644] font-bold text-xs"
              >
                <Link to="/login">
                  تسجيل الدخول الآن
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="طلباتي وتتبع الشحنات — إيوان"
        description="متابعة مراحل تجهيز وتوصيل طلبات الأثاث في المكلا والتقييم المعتمد بعد الاستلام."
      />

      <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          {/* الترويسة الهادئة */}
          <div className="border-b border-[#E5DEC9] pb-6 sm:pb-8 mb-8">
            <span className="eyebrow text-[#9C6644]">سجل المشتريات والتوصيل</span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl text-[#231F1E]">
              طلباتي وتتبع الشحنات
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#786C65]">
              تابع حالة شحناتك خطوة بخطوة من المعرض حتى التسليم، وقدم تقييمك الرسمي بعد استلام الطلب.
            </p>
          </div>

          {/* بطاقة التنبيه المرئية لحالة الطلب الحالي */}
          {activeOrder && (
            <div className="mb-8 overflow-hidden rounded-3xl border border-[#E5DEC9] bg-gradient-to-br from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#9C6644] text-[#FAF7F2] shadow-xs">
                    {activeOrder.status === 'done' || activeOrder.status === 'delivered' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : activeOrder.status === 'shipping' || activeOrder.status === 'in_progress' ? (
                      <Truck className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                    {activeOrder.status !== 'done' && activeOrder.status !== 'delivered' && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9C6644] opacity-75"></span>
                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#9C6644] border-2 border-[#FAF7F2]"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#9C6644]/15 border border-[#9C6644]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#9C6644]">
                        {activeOrder.status === 'done' || activeOrder.status === 'delivered'
                          ? 'آخر طلب مكتمل'
                          : 'تنبيه حالة طلبك الحالي'}
                      </span>
                      <span className="text-xs font-semibold text-[#786C65]" dir="ltr">
                        {formatOrderCode(parseOrderDetails(activeOrder.details).productCode, activeOrder.dbId)}
                      </span>
                    </div>
                    <h2 className="mt-1 font-display text-base sm:text-lg font-bold text-[#231F1E]">
                      {activeOrder.status === 'done' || activeOrder.status === 'delivered'
                        ? 'تم تسليم طلبك بنجاح'
                        : activeOrder.status === 'shipping' || activeOrder.status === 'in_progress'
                        ? 'طلبك خرج للتوصيل مع مندوب إيوان بالمكلا'
                        : activeOrder.status === 'processing' || activeOrder.status === 'contacted'
                        ? 'طلبك قيد التجهيز والمراجعة في المعرض حالياً'
                        : 'تم تأكيد الطلب وجاري إرساله للمعرض للتجهيز'}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#786C65] leading-relaxed">
                      {activeOrder.status === 'shipping' || activeOrder.status === 'in_progress'
                        ? 'الشحنة في طريقها إليك الآن عبر مندوب التوصيل المعتمد، وسيتواصل معك للتسليم.'
                        : activeOrder.status === 'processing' || activeOrder.status === 'contacted'
                        ? 'فريق المعرض يقوم بفحص وتجهيز قطع الأثاث الخاصة بك بعناية فائقة قبل تسليمها للمندوب.'
                        : activeOrder.status === 'done' || activeOrder.status === 'delivered'
                        ? 'شكراً لتسوقك من معارض إيوان المكلا! نسعد باستقبال تقييمك لجودة القطع والتوصيل.'
                        : 'طلبك مسجل ومعتمد في منصة إيوان، ويتم التواصل مع المعرض لتأكيد توفر القطع.'}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#E5DEC9] pt-3 sm:pt-0 shrink-0">
                  <span className="text-[11px] text-[#786C65]">المعرض المسؤول:</span>
                  <span className="text-xs font-bold text-[#231F1E] flex items-center gap-1 mt-0.5">
                    <Store className="h-3.5 w-3.5 text-[#9C6644]" />
                    {parseOrderDetails(activeOrder.details).storeName || 'معارض إيوان المكلا'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* قائمة الطلبات */}
          {myOrders.length === 0 ? (
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-[#9C6644]/40 mb-3" />
              <h3 className="font-display text-lg font-bold text-[#231F1E]">لا توجد طلبات مسجلة بعد</h3>
              <p className="mt-1 text-xs text-[#786C65] max-w-sm mx-auto">
                تصفح أرقى معارض المكلا واختر قطع أثاثك لتظهر مراحل تجهيزها وتوصيلها هنا.
              </p>
              <Button asChild className="mt-6 rounded-full bg-[#231F1E] px-6 text-xs text-[#FAF7F2] hover:bg-[#9C6644]">
                <Link to="/shop">
                  تصفح المتجر الآن
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((req) => {
                const order = parseOrderDetails(req.details);
                const currentStep = getStepIndex(req.status);
                const isDelivered = req.status === 'done' || req.status === 'delivered';
                const formattedCode = formatOrderCode(order?.productCode, req.dbId);

                return (
                  <div
                    key={req.dbId}
                    className="overflow-hidden rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 shadow-2xs transition-shadow hover:shadow-xs"
                  >
                    {/* رأس بطاقة الطلب بتصميم رسمي */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] bg-[#F3EDE2]/90 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE7DA] text-[#9C6644] border border-[#E2D5C3]">
                          <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#231F1E]">
                            طلب: <span className="text-[#9C6644] mr-1 font-semibold" dir="ltr">{formattedCode}</span>
                          </p>
                          <p className="text-[11px] text-[#786C65] mt-0.5">
                            {new Date(order?.date || req.createdAt).toLocaleDateString('ar-YE', { dateStyle: 'long' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* شارة حالة الطلب الرسمية مع مؤشر لوني واضح */}
                        <span
                          className={cn(
                            'rounded-full px-3.5 py-1 text-xs font-semibold border flex items-center gap-1.5',
                            isDelivered
                              ? 'bg-[#EFE7DA] text-[#231F1E] border-[#D8CBB8]'
                              : currentStep === 3
                              ? 'bg-[#9C6644]/15 text-[#9C6644] border-[#9C6644]/30'
                              : currentStep === 2
                              ? 'bg-[#F5EFE6] text-[#9C6644] border-[#DED4C6]'
                              : 'bg-[#FAF7F2] text-[#786C65] border-[#E5DEC9]',
                          )}
                        >
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              isDelivered
                                ? 'bg-[#231F1E]'
                                : currentStep === 3
                                ? 'bg-[#9C6644] animate-pulse'
                                : currentStep === 2
                                ? 'bg-[#9C6644]'
                                : 'bg-[#786C65]',
                            )}
                          />
                          {isDelivered
                            ? 'تم التسليم'
                            : currentStep === 3
                            ? 'خرج للتوصيل'
                            : currentStep === 2
                            ? 'قيد التجهيز بالمعرض'
                            : 'تم تأكيد الطلب'}
                        </span>
                      </div>
                    </div>

                    {/* تفاصيل القطع والمعرض */}
                    <div className="p-5 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 border-b border-[#E5DEC9] pb-5 text-xs">
                        <div>
                          <span className="block text-[#786C65] mb-1">القطع المطلوبة:</span>
                          <span className="font-bold text-[#231F1E] text-sm">
                            {order ? order.productName : req.details}
                          </span>
                          <span className="block text-[11px] text-[#9C6644] mt-0.5">
                            الكمية: {order ? order.quantity : 1}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[#786C65] mb-1">المعرض المعتمد:</span>
                          <span className="font-bold text-[#231F1E] flex items-center gap-1">
                            <Store className="h-3.5 w-3.5 text-[#9C6644]" />
                            {order ? order.storeName : 'معارض إيوان المكلا'}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[#786C65] mb-1">الإجمالي والدفع:</span>
                          <span className="font-bold text-sm text-[#231F1E]">
                            {order ? formatPrice(order.price) : '—'}
                          </span>
                          <span className="block text-[11px] text-[#786C65] mt-0.5">
                            {order?.paymentLabel || 'الدفع عند الاستلام'}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[#786C65] mb-1">العنوان:</span>
                          <span className="font-medium text-[#231F1E] flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#9C6644]" />
                            {req.name} ({req.phone})
                          </span>
                          <span className="block text-[10px] text-[#786C65] mt-0.5">المكلا — حضرموت</span>
                        </div>
                      </div>

                      {/* شريط التتبع البصري للمراحل (Order Tracker) بألوان Casa الدافئة */}
                      <div className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-bold text-[#231F1E] flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-[#9C6644]" />
                            {currentStep === 3
                              ? 'طلبك في الطريق إليك مع مندوب التوصيل:'
                              : 'مراحل سير الطلب والتوصيل:'}
                          </p>
                          <span className="text-[11px] text-[#9C6644] font-medium">
                            {currentStep === 3 ? 'جاري التوصيل الآن بالمكلا' : 'الموعد التقديري: خلال 24 - 48 ساعة'}
                          </span>
                        </div>

                        <div className="relative mt-2">
                          {/* الخط الواصل بلون رسمي */}
                          <div className="absolute top-4 right-6 left-6 h-1 bg-[#E5DEC9] -z-0">
                            <div
                              className="h-full bg-[#9C6644] transition-all duration-500"
                              style={{ width: `${((currentStep - 1) / (trackerSteps.length - 1)) * 100}%` }}
                            />
                          </div>

                          {/* نقاط المراحل */}
                          <div className="relative z-10 grid grid-cols-4 text-center">
                            {trackerSteps.map((s) => {
                              const isPassed = s.step <= currentStep;
                              const isCurrent = s.step === currentStep;

                              return (
                                <div key={s.step} className="flex flex-col items-center">
                                  <div
                                    className={cn(
                                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-2xs',
                                      isPassed
                                        ? 'bg-[#9C6644] text-[#FAF7F2] ring-4 ring-[#9C6644]/15'
                                        : 'bg-[#FAF7F2] text-[#786C65] border-2 border-[#E5DEC9]',
                                    )}
                                  >
                                    {isPassed ? <CheckCircle2 className="h-4 w-4" /> : s.step}
                                  </div>
                                  <p
                                    className={cn(
                                      'mt-2 text-xs font-semibold',
                                      isCurrent ? 'text-[#9C6644]' : isPassed ? 'text-[#231F1E]' : 'text-[#786C65]',
                                    )}
                                  >
                                    {s.label}
                                  </p>
                                  <p className="hidden sm:block text-[10px] text-[#786C65] mt-0.5 max-w-[110px]">
                                    {s.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* قسم التقييم المشروط الرسمي */}
                      <div className="mt-8 pt-5 border-t border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-[#786C65]">
                          {isDelivered ? (
                            <span className="text-[#9C6644] font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-[#9C6644]" />
                              تم تسليم هذا الطلب بنجاح — يسعدنا تسجيل تقييمك لجودة القطع والخدمة.
                            </span>
                          ) : (
                            <span className="text-[#786C65] font-normal flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#9C6644]" />
                              يتاح تقييم الخدمة والقطع بمجرد اكتمال التوصيل وتأكيد استلام الطلب.
                            </span>
                          )}
                        </div>

                        {/* زر التقييم الرسمي بدون إيموجي */}
                        {isDelivered && (
                          <Button
                            type="button"
                            onClick={() => handleOpenRating(order?.storeName || 'معرض الأثاث')}
                            className="h-10 rounded-full bg-[#231F1E] text-[#FAF7F2] hover:bg-[#9C6644] px-5 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Star className="h-3.5 w-3.5 fill-[#9C6644] text-[#9C6644]" strokeWidth={1.5} />
                            <span>قيّم تجربتك والمنتج</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* نافذة التقييم المعتمدة */}
      <RatingModal
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        defaultTarget={selectedStoreForRating}
      />
    </>
  );
};

export default MyOrdersPage;
