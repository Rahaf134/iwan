import { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  Percent,
  Search,
  Store as StoreIcon,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminEmpty, AdminSection } from '@/components/admin/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCatalog } from '@/contexts/CatalogContext';
import { formatPrice } from '@/data/catalog';
import { parseOrderDetails } from '@/lib/order';
import { cn } from '@/lib/utils';

export const AdminWalletManager = () => {
  const { requests, stores } = useCatalog();
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. استخراج وتنقية كافة الطلبات المعتمدة مع الحساب المالي الآلي للعمولة (4%)
  const validOrderTransactions = useMemo(() => {
    return requests
      .filter((r) => {
        if (r.type === 'chat_message' || r.type === 'lookbook_item') return false;
        if (!r.status) return false;

        const order = parseOrderDetails(r.details, r.phone, r.name);
        if (!order || !order.price || order.price <= 0) return false;

        const clientName = (order.customerName || r.name || '').trim().toLowerCase();
        if (
          clientName.includes('ريم الكثيري') ||
          clientName.includes('مديرة المنصة') ||
          clientName.includes('المزود') ||
          clientName === 'إيوان'
        ) {
          return false;
        }

        return true;
      })
      .map((r) => {
        const order = parseOrderDetails(r.details, r.phone, r.name);
        const quantity = order.quantity || 1;
        const totalAmount = (order.price || 0) * quantity;
        const commission = Math.round(totalAmount * 0.04);
        const netStoreAmount = totalAmount - commission;

        return {
          dbId: r.dbId,
          orderCode: order.productCode || `EW-${r.dbId.slice(-6).toUpperCase()}`,
          productName: order.productName || r.details,
          customerName: order.customerName || r.name || 'عميل إيوان',
          phone: r.phone || order.phone || '—',
          storeName: order.storeName || 'معارض إيوان المعتمدة',
          storeId: order.storeId,
          date: r.createdAt || order.date || new Date().toISOString(),
          status: r.status,
          totalAmount,
          commission,
          netStoreAmount,
          paymentMethod: order.paymentMethod || 'الدفع عند الاستلام',
        };
      });
  }, [requests]);

  // 2. حساب المؤشرات المالية العامة للمنصة
  const financialSummary = useMemo(() => {
    let totalGrossSales = 0;
    let totalPlatformCommission = 0;
    let totalNetStores = 0;

    validOrderTransactions.forEach((t) => {
      totalGrossSales += t.totalAmount;
      totalPlatformCommission += t.commission;
      totalNetStores += t.netStoreAmount;
    });

    return {
      totalGrossSales,
      totalPlatformCommission,
      totalNetStores,
      ordersCount: validOrderTransactions.length,
    };
  }, [validOrderTransactions]);

  // 3. ملخص العمولات والمبيعات لكل معرض على حدة
  const storeSummaries = useMemo(() => {
    const map = new Map<string, { storeName: string; totalSales: number; commission: number; netAmount: number; count: number }>();

    validOrderTransactions.forEach((t) => {
      const name = t.storeName;
      const existing = map.get(name) || { storeName: name, totalSales: 0, commission: 0, netAmount: 0, count: 0 };
      existing.totalSales += t.totalAmount;
      existing.commission += t.commission;
      existing.netAmount += t.netStoreAmount;
      existing.count += 1;
      map.set(name, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }, [validOrderTransactions]);

  // 4. تطبيق الفلترة بالمعرض أو بالبحث النصي
  const filteredTransactions = useMemo(() => {
    return validOrderTransactions.filter((t) => {
      if (selectedStoreFilter !== 'all') {
        if (!t.storeName.includes(selectedStoreFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.orderCode.toLowerCase().includes(q);
        const matchClient = t.customerName.toLowerCase().includes(q);
        const matchProduct = t.productName.toLowerCase().includes(q);
        const matchStore = t.storeName.toLowerCase().includes(q);
        if (!matchCode && !matchClient && !matchProduct && !matchStore) return false;
      }
      return true;
    });
  }, [validOrderTransactions, selectedStoreFilter, searchQuery]);

  // تصدير أو طباعة كشف الحساب المالي للمناقشة
  const handleExportStatement = () => {
    toast.success('تم إنشاء وتجهيز كشف التسوية المالية (عمولة 4%) بصيغة جاهزة للطباعة.');
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* ==================== 1. البطاقات المالية الثلاث الكبرى ==================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* بطاقة 1: إجمالي حجم المبيعات عبر المنصة */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs transition-all hover:border-[#9C6644]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#786C65]">إجمالي حجم المبيعات عبر المنصة</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EDE2] text-[#9C6644]">
              <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#231F1E] font-mono">
            {formatPrice(financialSummary.totalGrossSales)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#786C65]">
            <span>مجموع قيمة كافة الطلبات المعتمدة</span>
            <span className="rounded-full bg-[#F3EDE2] px-2 py-0.5 font-bold text-[#231F1E]">
              {financialSummary.ordersCount} طلب
            </span>
          </div>
        </div>

        {/* بطاقة 2: صافي أرباح محفظة إيوان (عمولة 4%) */}
        <div className="rounded-3xl border-2 border-[#9C6644]/30 bg-[#F3EDE2] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#9C6644] text-white px-3 py-0.5 rounded-br-2xl text-[10px] font-bold">
            دخل المنصة الآلي
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C4A32]">صافي أرباح محفظة إيوان (عمولة 4%)</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF7F2] text-[#8C4A32] shadow-xs">
              <Percent className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#8C4A32] font-mono">
            {formatPrice(financialSummary.totalPlatformCommission)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#786C65]">
            <span>تودع آلياً في حساب الإدارة مع كل طلب</span>
            <span className="font-bold text-[#8C4A32]">نسبة ثابتة 4%</span>
          </div>
        </div>

        {/* بطاقة 3: إجمالي مستحقات المعارض المحولة (96%) */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs transition-all hover:border-[#9C6644]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#786C65]">إجمالي مستحقات المعارض (96%)</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EDE2] text-[#231F1E]">
              <Wallet className="h-5 w-5" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#231F1E] font-mono">
            {formatPrice(financialSummary.totalNetStores)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-[#786C65]">
            <span>صافي أرباح معارض الأثاث والمصممين</span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              محمية ومسواة
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 2. توزيع العمولات بحسب المعارض ==================== */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#231F1E]">
              ملخص محافظ المعارض والعمولات المستحقة
            </h3>
            <p className="text-xs text-[#786C65] mt-0.5">
              متابعة حجم مبيعات كل معرض ومجموع عمولة الـ 4% المحتسبة لصالحه
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportStatement}
            className="h-9 rounded-full border-[#DED4C6] bg-[#F3EDE2] text-xs font-bold text-[#231F1E] hover:bg-[#E5DEC9]"
          >
            <Download className="ml-1.5 h-3.5 w-3.5" />
            طباعة كشف الحساب
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storeSummaries.map((s) => (
            <div
              key={s.storeName}
              className="rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/60 p-4 transition-all hover:bg-[#F3EDE2]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#231F1E] line-clamp-1">{s.storeName}</span>
                <span className="rounded-full bg-[#FAF7F2] border border-[#E5DEC9] px-2 py-0.5 text-[10px] font-bold text-[#9C6644]">
                  {s.count} طلب
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#786C65]">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-mono font-bold text-[#231F1E]">{formatPrice(s.totalSales)}</span>
                </div>
                <div className="flex justify-between text-[#8C4A32]">
                  <span>عمولة إيوان (4%):</span>
                  <span className="font-mono font-bold">+{formatPrice(s.commission)}</span>
                </div>
                <div className="flex justify-between text-[#5C534E] border-t border-[#E5DEC9]/80 pt-1.5">
                  <span className="font-semibold">صافي المعرض (96%):</span>
                  <span className="font-mono font-bold text-[#231F1E]">{formatPrice(s.netAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 3. سجل الحركات والطلبات التفصيلي ==================== */}
      <AdminSection
        title="كشف العمليات والتسويات المالية لكل طلب"
        description="سجل تفصيلي يوضح كل طلب شراء، وقيمته الإجمالية، ونسبة الـ 4% التي دخلت محفظة المنصة وصافي مستحق المعرض."
      >
        {/* شريط الفلترة والبحث */}
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#786C65]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، العميل، المعرض…"
              className="h-9 w-full rounded-full border border-[#DED4C6] bg-[#FAF7F2] pr-9 pl-3 text-xs text-[#231F1E] placeholder:text-[#786C65] focus:outline-none focus:border-[#9C6644]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#786C65]" />
            <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
              <SelectTrigger className="h-9 w-full sm:w-60 rounded-full border-[#DED4C6] bg-[#FAF7F2] text-xs font-bold text-[#231F1E]">
                <SelectValue placeholder="تصفية حسب المعرض" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                <SelectItem value="all" className="text-xs font-bold">جميع المعارض والمصممين</SelectItem>
                {storeSummaries.map((s) => (
                  <SelectItem key={s.storeName} value={s.storeName} className="text-xs">
                    {s.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <AdminEmpty message="لا توجد حركات مالية مطابقة للبحث." />
        ) : (
          <div className="w-full overflow-hidden rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs table-auto">
                <thead>
                  <tr className="border-b border-[#E5DEC9] bg-[#F3EDE2] text-[#231F1E]">
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">رقم الطلب</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">المعرض</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">العميل</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">القطعة</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">قيمة الطلب</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap text-[#8C4A32]">عمولة إيوان (4%)</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">صافي المعرض (96%)</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">التاريخ</th>
                    <th className="px-3.5 py-3 font-bold whitespace-nowrap">حالة التسوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]/60 text-[#231F1E]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.dbId} className="hover:bg-[#F3EDE2]/40 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-[#9C6644] whitespace-nowrap">
                        #{tx.orderCode}
                      </td>
                      <td className="px-3.5 py-3 font-bold whitespace-nowrap">
                        <span className="rounded-lg bg-[#F3EDE2] px-2 py-0.5 text-[11px] text-[#231F1E]">
                          {tx.storeName}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-bold text-[#231F1E]">{tx.customerName}</div>
                        <div className="font-mono text-[10px] text-[#786C65]" dir="ltr">{tx.phone}</div>
                      </td>
                      <td className="px-3.5 py-3 max-w-[180px] truncate" title={tx.productName}>
                        {tx.productName}
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#231F1E] whitespace-nowrap">
                        {formatPrice(tx.totalAmount)}
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#8C4A32] whitespace-nowrap bg-[#F3EDE2]/30">
                        +{formatPrice(tx.commission)}
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {formatPrice(tx.netStoreAmount)}
                      </td>
                      <td className="px-3.5 py-3 text-[#786C65] text-[11px] whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          مودعة في المحفظة
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminSection>
    </div>
  );
};
