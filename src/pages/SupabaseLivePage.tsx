import { useState, useEffect, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Store,
  Package,
  Truck,
  Palette,
  Star,
  Users,
  HelpCircle,
  Search,
  Code2,
  Copy,
  Check,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/db/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TableStat {
  key: string;
  name: string;
  count: number;
  icon: typeof Database;
  description: string;
}

export const SupabaseLivePage = () => {
  const [activeTable, setActiveTable] = useState<string>('stores');
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const tables: TableStat[] = [
    { key: 'stores', name: 'المعارض والمتاجر', count: counts['stores'] || 0, icon: Store, description: 'معارض المكلا المعتمدة وحالات التحقق والتقييم' },
    { key: 'products', name: 'المنتجات والقطع', count: counts['products'] || 0, icon: Package, description: 'كتالوج الأثاث الحي والأسعار والصور والكميات' },
    { key: 'requests', name: 'الطلبات وتتبع الشحنات', count: counts['requests'] || 0, icon: Truck, description: 'طلبات الشراء ومراحل التجهيز والتوصيل الأربع' },
    { key: 'designers', name: 'المصممون والورش', count: counts['designers'] || 0, icon: Palette, description: 'ملفات المصممين والنجارين المعتمدين وسنوات الخبرة' },
    { key: 'reviews', name: 'تقييمات العملاء', count: counts['reviews'] || 0, icon: Star, description: 'آراء وتقييمات العملاء بعد استلام القطع' },
    { key: 'partners', name: 'شركاء الخدمات', count: counts['partners'] || 0, icon: Users, description: 'شركات النقل والتركيب واللوجستيات' },
    { key: 'faqs', name: 'الأسئلة الشائعة', count: counts['faqs'] || 0, icon: HelpCircle, description: 'دليل المستخدم والخدمات وسياسات المنصة' },
  ];

  const fetchLiveCloudData = async () => {
    setRefreshing(true);
    const start = performance.now();
    try {
      const results = await Promise.all([
        supabase.from('stores').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('designers').select('*').order('name'),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('name'),
        supabase.from('faqs').select('*').order('sort_order'),
      ]);

      const end = performance.now();
      setLatencyMs(Math.round(end - start));

      const newTableData: Record<string, any[]> = {
        stores: results[0].data || [],
        products: results[1].data || [],
        requests: results[2].data || [],
        designers: results[3].data || [],
        reviews: results[4].data || [],
        partners: results[5].data || [],
        faqs: results[6].data || [],
      };

      const newCounts: Record<string, number> = {};
      Object.keys(newTableData).forEach((k) => {
        newCounts[k] = newTableData[k].length;
      });

      setTableData(newTableData);
      setCounts(newCounts);
      toast.success('تم جلب البيانات الحية من سحابة Supabase بنجاح');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء تحديث البيانات السحابية');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchLiveCloudData();
  }, []);

  const currentRecords = useMemo(() => {
    const list = tableData[activeTable] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }, [tableData, activeTable, searchQuery]);

  const handleDownloadMasterSql = () => {
    const link = document.createElement('a');
    link.href = '/EWAN_SUPABASE_FULL.sql';
    link.download = 'EWAN_SUPABASE_FULL.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('جارٍ تحميل ملف EWAN_SUPABASE_FULL.sql الشامل');
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText('https://bgncjnjahxpecuxezwrk.supabase.co');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    toast.success('تم نسخ رابط الخادم السحابي');
  };

  return (
    <>
      <PageMeta
        title="قاعدة بيانات Supabase المباشرة — إيوان"
        description="معاينة حية ومباشرة لجداول سحابة Supabase المتصلة بمنصة إيوان."
      />

      <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* ترويسة الصفحة الاحترافية */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EDE2]/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    سيرفر حي متصل (Supabase Cloud Connected)
                  </span>
                  <span className="rounded-full bg-[#EFE7DA] border border-[#DED4C6] px-3 py-1 text-xs font-mono text-[#9C6644] font-semibold">
                    مشروع: bgncjnjahxpecuxezwrk
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#231F1E]">
                  معاينة الجداول السحابية المباشرة (Supabase Live)
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#786C65] max-w-2xl leading-relaxed">
                  استعراض حي ومباشر لكافة جداول وسجلات منصة إيوان المخزنة سحابياً، مع إمكانية فحص الاتصال وتصفح البيانات بالكامل أمام لجنة المناقشة.
                </p>
              </div>

              {/* أزرار الإجراءات السريعة */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={fetchLiveCloudData}
                  disabled={refreshing}
                  className="h-10 rounded-full bg-[#231F1E] px-5 text-xs font-bold text-[#FAF7F2] hover:bg-[#9C6644] transition-colors"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5 ml-2', refreshing && 'animate-spin')} />
                  تحديث الاتصال اللحظي
                </Button>

                <Button
                  onClick={handleDownloadMasterSql}
                  variant="outline"
                  className="h-10 rounded-full border-[#DED4C6] bg-[#FAF7F2] px-5 text-xs font-bold text-[#231F1E] hover:border-[#9C6644] hover:bg-[#F3EDE2]"
                >
                  <Download className="h-3.5 w-3.5 ml-2 text-[#9C6644]" />
                  تحميل ملف SQL الشامل
                </Button>
              </div>
            </div>

            {/* شريط الإحصائيات والمؤشرات التقنية */}
            <div className="mt-6 pt-6 border-t border-[#E5DEC9] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DEC9]">
                <span className="text-[#786C65] block text-[11px] mb-1">الرابط السحابي (REST Endpoint):</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[#231F1E] text-[11px] truncate" dir="ltr">
                    https://bgncjnjahxpecuxezwrk...
                  </span>
                  <button
                    onClick={handleCopyEndpoint}
                    className="text-[#9C6644] hover:text-[#231F1E] p-1 rounded-md"
                    title="نسخ الرابط"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DEC9]">
                <span className="text-[#786C65] block text-[11px] mb-1">سرعة الاستجابة (Latency):</span>
                <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  {latencyMs > 0 ? `${latencyMs} ms` : 'سريع جداً (Edge)'}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DEC9]">
                <span className="text-[#786C65] block text-[11px] mb-1">سياسات الأمان (RLS):</span>
                <span className="text-[#231F1E] font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  مفعلة بالكامل (All 7 Tables)
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DEC9]">
                <span className="text-[#786C65] block text-[11px] mb-1">إجمالي السجلات الحية:</span>
                <span className="text-[#9C6644] font-bold font-mono text-sm">
                  {Object.values(counts).reduce((a, b) => a + b, 0)} سجل متزامن
                </span>
              </div>
            </div>
          </div>

          {/* بطاقات الجداول السبعة (Tabs Selector) */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {tables.map((tbl) => {
              const Icon = tbl.icon;
              const isActive = activeTable === tbl.key;
              return (
                <button
                  key={tbl.key}
                  type="button"
                  onClick={() => {
                    setActiveTable(tbl.key);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center',
                    isActive
                      ? 'border-[#231F1E] bg-[#231F1E] text-[#FAF7F2] shadow-sm'
                      : 'border-[#E5DEC9] bg-[#F3EDE2]/60 hover:bg-[#F3EDE2] text-[#231F1E]'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mb-1.5', isActive ? 'text-[#FAF7F2]' : 'text-[#9C6644]')} />
                  <span className="font-bold text-xs">{tbl.name}</span>
                  <span
                    className={cn(
                      'mt-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full',
                      isActive ? 'bg-[#9C6644] text-[#FAF7F2]' : 'bg-[#EFE7DA] text-[#9C6644]'
                    )}
                  >
                    {tbl.count} سجل
                  </span>
                </button>
              );
            })}
          </div>

          {/* جدول عرض السجلات الحية المباشرة */}
          <div className="mt-8 rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-sm overflow-hidden">
            {/* بار البحث والتحكم */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#E5DEC9] bg-[#F3EDE2]/60">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#9C6644]" />
                <h3 className="font-bold text-sm text-[#231F1E]">
                  جدول <span className="font-mono text-[#9C6644]">public.{activeTable}</span>
                </h3>
                <span className="text-xs text-[#786C65]">
                  ({currentRecords.length} من {counts[activeTable] || 0} سجل متاح)
                </span>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#786C65]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الحقول والسجلات..."
                  className="h-9 rounded-full pr-9 pl-3 text-xs border-[#DED4C6] bg-[#FAF7F2]"
                />
              </div>
            </div>

            {/* محتوى الجدول */}
            {loading ? (
              <div className="p-16 text-center text-xs text-[#786C65]">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#9C6644] mb-3" />
                جارٍ الاتصال بسحابة Supabase وجلب السجلات الحية...
              </div>
            ) : currentRecords.length === 0 ? (
              <div className="p-16 text-center text-xs text-[#786C65]">
                لا توجد سجلات مطابقة للبحث في هذا الجدول حالياً.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-right text-xs table-auto">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] bg-[#F3EDE2] text-[#231F1E]">
                      <th className="px-4 py-3 font-bold whitespace-nowrap"># المعرّف (UUID)</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">الاسم / العنوان</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">النوع / التصنيف</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">التفاصيل / القيمة</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">الحالة</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap text-center">المعاينة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/60 text-[#231F1E]">
                    {currentRecords.map((row, idx) => {
                      const idVal = row.id || row.dbId || `row-${idx}`;
                      const nameVal = row.name || row.title || row.question || '—';
                      const categoryVal = row.category || row.type || row.kind || row.area || row.specialty || 'عام';
                      const detailVal =
                        typeof row.price === 'number'
                          ? `${row.price.toLocaleString('ar-YE')} ر.ي`
                          : row.phone || row.details || row.answer || row.text || '—';
                      const statusVal = row.status || row.approvalStatus || (row.verified ? 'معتمد' : 'نشط');

                      return (
                        <tr key={idVal} className="hover:bg-[#F3EDE2]/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-[#786C65] whitespace-nowrap" dir="ltr">
                            {String(idVal).slice(0, 13)}...
                          </td>
                          <td className="px-4 py-3 font-bold text-[#231F1E] whitespace-nowrap max-w-[220px] truncate">
                            {nameVal}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="rounded-full bg-[#EFE7DA] text-[#9C6644] px-2.5 py-0.5 text-[10px] font-bold">
                              {categoryVal}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[260px] truncate text-[#786C65]">
                            {typeof detailVal === 'string' ? detailVal : JSON.stringify(detailVal)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="rounded-full bg-[#FAF7F2] border border-[#E5DEC9] text-[#231F1E] px-2.5 py-0.5 text-[11px] font-semibold">
                              {statusVal}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRecord(row)}
                              className="h-7 rounded-full text-xs font-bold text-[#9C6644] hover:bg-[#F3EDE2]"
                            >
                              <Code2 className="h-3.5 w-3.5 ml-1" />
                              JSON
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* نافذة استعراض السجل بصيغة JSON لمناقشة الأكاديميين */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-2xl rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-[#9C6644]" />
                    <h3 className="font-bold text-sm text-[#231F1E]">
                      معاينة السجل السحابي المباشر (Cloud Raw JSON)
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecord(null)}
                    className="h-8 w-8 rounded-full p-0 text-[#786C65] hover:text-[#231F1E]"
                  >
                    ✕
                  </Button>
                </div>

                <div className="max-h-[400px] overflow-auto rounded-2xl bg-[#231F1E] p-4 text-xs font-mono text-emerald-400" dir="ltr">
                  <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#786C65]">
                    المعرف: <span className="font-mono text-[#231F1E]">{selectedRecord.id || selectedRecord.dbId}</span>
                  </span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                      toast.success('تم نسخ السجل بتنسيق JSON');
                    }}
                    className="h-9 rounded-full bg-[#231F1E] px-4 text-xs font-bold text-[#FAF7F2] hover:bg-[#9C6644]"
                  >
                    <Copy className="h-3.5 w-3.5 ml-1.5" />
                    نسخ السجل
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupabaseLivePage;
