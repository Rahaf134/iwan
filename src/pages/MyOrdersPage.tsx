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
  { step: 3, label: 'خرج للتوصيل', desc: 'في الطريق لموقعك بالمكلا' },
  { step: 4, label: 'تم التسليم (مكتمل)', desc: 'المعاينة والاستلام' },
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
  const { profile } = useAuth();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStoreForRating, setSelectedStoreForRating] = useState<string>('');

  // استخراج طلبات العميل الخاص بالحساب المسجل حالياً فقط
  const myOrders = useMemo(() => {
    if (!profile) return [];
    
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

    const userEmail = (profile.email || '').trim().toLowerCase();
    const userId = profile.id;
    const userPhoneClean = (profile.phone || '').replace(/\D/g, '');
    const userName = (profile.fullName || '').trim().toLowerCase();

    return allSources.filter((r) => {
      const details = parseOrderDetails(r.details, r.phone, r.name);

      // 1. مطابقة البريد الإلكتروني للعميل
      if (details.customerEmail && details.customerEmail.trim().toLowerCase() === userEmail) {
        return true;
      }
      // 2. مطابقة معرف العميل
      if (userId && details.userId && details.userId === userId) {
        return true;
      }
      // 3. مطابقة رقم الهاتف المسجل
      const orderPhoneClean = (details.phone || r.phone || '').replace(/\D/g, '');
      if (
        userPhoneClean &&
        orderPhoneClean &&
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
        orderCustomerName &&
        (orderCustomerName === userName || (userName.length > 3 && orderCustomerName.includes(userName)))
      ) {
        return true;
      }

      return false;
    });
  }, [requests, profile]);

  const getStepIndex = (status: string): number => {
    switch (status) {
      case 'new':
        return 1;
      case 'contacted':
        return 2;
      case 'processing':
        return 3;
      case 'done':
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
  if (!profile) {
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
                const isDelivered = req.status === 'done';
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
                            طلب: <span className="font-mono text-[#9C6644] mr-1" dir="ltr">{formattedCode}</span>
                          </p>
                          <p className="text-[11px] text-[#786C65] mt-0.5">
                            {new Date(order?.date || req.createdAt).toLocaleDateString('ar-YE', { dateStyle: 'long' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* شارة حالة الطلب الرسمية والهادئة */}
                        <span
                          className={cn(
                            'rounded-full px-3.5 py-1 text-xs font-semibold border',
                            isDelivered
                              ? 'bg-[#EFE7DA] text-[#9C6644] border-[#E2D5C3]'
                              : 'bg-[#FAF7F2] text-[#786C65] border-[#E5DEC9]',
                          )}
                        >
                          {isDelivered ? 'تم التسليم بنجاح' : trackerSteps[currentStep - 1]?.label || 'قيد المتابعة'}
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
                            مراحل سير الطلب والتوصيل:
                          </p>
                          <span className="text-[11px] text-[#9C6644] font-medium">
                            الموعد التقديري: خلال 24 - 48 ساعة
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
