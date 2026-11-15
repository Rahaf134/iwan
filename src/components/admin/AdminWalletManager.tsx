import { useState, useMemo } from 'react';
import {
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
  const { requests } = useCatalog();
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
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  // تصدير أو طباعة كشف الحساب المالي
  const handleExportStatement = () => {
    toast.success('تم تجهيز كشف التسوية المالية (عمولة 4%) بصيغة جاهزة للطباعة.');
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* ==================== 1. البطاقات المالية الثلاث ==================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* بطاقة 1: إجمالي المبيعات */}
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C4938]">إجمالي المبيعات</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3EDE2] text-[#8C7355]">
              <TrendingUp className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#2C221E]">
            {formatPrice(financialSummary.totalGrossSales)}
          </p>
        </div>

        {/* بطاقة 2: عمولة إيوان (4%) */}
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C4938]">عمولة إيوان (4%)</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3EDE2] text-[#8C7355]">
              <Percent className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#8C7355]">
            {formatPrice(financialSummary.totalPlatformCommission)}
          </p>
        </div>

        {/* بطاقة 3: صافي مستحقات المعارض */}
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C4938]">صافي مستحقات المعارض</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3EDE2] text-[#8C7355]">
              <Wallet className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#2C221E]">
            {formatPrice(financialSummary.totalNetStores)}
          </p>
        </div>
      </div>

      {/* ==================== 2. توزيع العمولات بحسب المعارض ==================== */}
      <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C221E]">
              ملخص محافظ المعارض والعمولات
            </h3>
          </div>
          <Button
            variant="outline"
            onClick={handleExportStatement}
            className="h-8 rounded-full border-[#DED4C6] bg-[#F3EDE2] text-xs font-semibold text-[#2C221E] hover:bg-[#E5DEC9]"
          >
            <Download className="ml-1.5 h-3.5 w-3.5" />
            طباعة كشف الحساب
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storeSummaries.map((s) => (
            <div
              key={s.storeName}
              className="rounded-xl border border-[#E5DEC9] bg-[#F3EDE2]/50 p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#2C221E] line-clamp-1">{s.storeName}</span>
                <span className="rounded-full bg-[#FAF7F2] border border-[#E5DEC9] px-2 py-0.5 text-[10px] font-semibold text-[#8C7355]">
                  {s.count} طلب
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5C4938]">
                  <span>المبيعات:</span>
                  <span className="font-bold text-[#2C221E]">{formatPrice(s.totalSales)}</span>
                </div>
                <div className="flex justify-between text-[#8C7355]">
                  <span>عمولة إيوان (4%):</span>
                  <span className="font-bold">+{formatPrice(s.commission)}</span>
                </div>
                <div className="flex justify-between text-[#5C4938] border-t border-[#E5DEC9]/80 pt-1.5">
                  <span>صافي المعرض:</span>
                  <span className="font-bold text-[#2C221E]">{formatPrice(s.netAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 3. سجل الحركات والطلبات التفصيلي ==================== */}
      <AdminSection
        title="كشف العمليات والتسويات المالية"
        description="سجل تفصيلي يوضح كل طلب شراء، وقيمته الإجمالية، وعمولة المنصة وصافي مستحق المعرض."
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
              className="h-9 w-full rounded-full border border-[#DED4C6] bg-[#FAF7F2] pr-9 pl-3 text-xs text-[#2C221E] placeholder:text-[#786C65] focus:outline-none focus:border-[#8C7355]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#786C65]" />
            <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
              <SelectTrigger className="h-9 w-full sm:w-60 rounded-full border-[#DED4C6] bg-[#FAF7F2] text-xs font-semibold text-[#2C221E]">
                <SelectValue placeholder="تصفية حسب المعرض" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#E5DEC9] bg-[#FAF7F2]">
                <SelectItem value="all" className="text-xs font-semibold">جميع المعارض والمصممين</SelectItem>
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
          <div className="w-full overflow-hidden rounded-xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs table-auto">
                <thead>
                  <tr className="border-b border-[#E5DEC9] bg-[#F3EDE2] text-[#2C221E]">
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">الطلب</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">المعرض</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">العميل</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">القطعة</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">المبلغ</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap text-[#8C7355]">عمولة إيوان (4%)</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">صافي المعرض</th>
                    <th className="px-3.5 py-3 font-semibold whitespace-nowrap">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]/60 text-[#2C221E]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.dbId} className="hover:bg-[#F3EDE2]/40 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-[#8C7355] whitespace-nowrap">
                        #{tx.orderCode}
                      </td>
                      <td className="px-3.5 py-3 font-medium whitespace-nowrap">
                        <span className="rounded-md bg-[#F3EDE2] px-2 py-0.5 text-[11px] text-[#2C221E]">
                          {tx.storeName}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-[#2C221E]">{tx.customerName}</div>
                        <div className="text-[10px] text-[#786C65]" dir="ltr">{tx.phone}</div>
                      </td>
                      <td className="px-3.5 py-3 max-w-[180px] truncate" title={tx.productName}>
                        {tx.productName}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-[#2C221E] whitespace-nowrap">
                        {formatPrice(tx.totalAmount)}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-[#8C7355] whitespace-nowrap bg-[#F3EDE2]/30">
                        +{formatPrice(tx.commission)}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-[#2C221E] whitespace-nowrap">
                        {formatPrice(tx.netStoreAmount)}
                      </td>
                      <td className="px-3.5 py-3 text-[#786C65] text-[11px] whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('ar-YE')}
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
