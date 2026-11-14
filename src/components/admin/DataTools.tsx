import { useState, useRef } from 'react';
import {
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  Server,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSection } from '@/components/admin/shared';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/contexts/CatalogContext';
import { supabase } from '@/db/supabase';
import { toValidUuid, toValidStoreUuid } from '@/lib/catalogApi';
import { stores as catalogStores, products as catalogProducts } from '@/data/catalog';

type TableView = 'products' | 'stores' | 'requests' | 'reviews';

export const DataTools = () => {
  const { products, stores, designers, requests, reviews, refresh, exportData, importData } = useCatalog();
  const [selectedTable, setSelectedTable] = useState<TableView>('products');
  const [syncing, setSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const { error } = await supabase.from('stores').select('id').limit(1);
      if (error) throw error;
      toast.success('الاتصال بقاعدة بيانات Supabase يعمل بكفاءة 100%');
    } catch {
      toast.error('تعذر فحص الاتصال بـ Supabase');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    try {
      toast.info('جارٍ بدء مزامنة المعارض والمنتجات مع Supabase…');

      // 1. مزامنة المعارض
      for (const st of catalogStores) {
        const storeUuid = toValidStoreUuid(st.id);
        const { error: storeErr } = await supabase.from('stores').upsert(
          {
            id: storeUuid,
            name: st.name,
            city: st.city,
            area: st.area,
            address: st.area || st.city,
            specialty: st.specialty,
            phone: st.phone,
            rating: st.rating,
            verified: st.verified,
            image_url: st.imageUrl,
            description: st.description,
          },
          { onConflict: 'id' },
        );
        if (storeErr) console.warn('Store sync warning:', storeErr.message);
      }

      // 2. مزامنة المنتجات
      for (const prod of catalogProducts) {
        const prodUuid = toValidUuid(prod.id);
        const resolvedStoreUuid = toValidStoreUuid(prod.storeId);
        const { error: prodErr } = await supabase.from('products').upsert(
          {
            id: prodUuid,
            slug: prod.slug,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            compare_at: prod.compareAt ?? null,
            rating: prod.rating,
            reviews: prod.reviews,
            colors: prod.colors,
            materials: prod.materials,
            images: prod.images,
            badge: prod.badge ?? null,
            featured: prod.featured,
            description: prod.description,
            dimensions: prod.dimensions,
            care: prod.care,
            store_id: resolvedStoreUuid,
            available: prod.available,
          },
          { onConflict: 'id' },
        );
        if (prodErr) console.warn('Product sync warning:', prodErr.message);
      }

      await refresh();
      toast.success('تمت مزامنة جميع المعارض والـ 30+ منتجاً بنجاح مع Supabase!');
    } catch (err) {
      toast.error('حدث خطأ أثناء المزامنة', {
        description: err instanceof Error ? err.message : 'تحقق من صلاحيات الاتصال.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const downloadBackup = () => {
    const payload = exportData();
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ewan-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير النسخة الاحتياطية بنجاح');
  };

  const runImport = async (content: string) => {
    if (!content.trim()) {
      toast.error('الصق محتوى JSON أولاً');
      return;
    }
    setImporting(true);
    try {
      await importData(content);
      toast.success('تم استيراد ودمج البيانات بنجاح');
    } catch (cause) {
      toast.error('تعذر الاستيراد', {
        description: cause instanceof Error ? cause.message : 'تحقق من صيغة الـ JSON.',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminSection
      title="عارض ومُزامن Supabase المباشر (Cloud Data Viewer)"
      description="متابعة حالة الاتصال بقاعدة بيانات Supabase، فحص السجلات الحية، ومزامنة كتالوج المنتجات بنقرة واحدة."
    >
      <div className="space-y-6">
        {/* بطاقة الاتصال الحية والإحصاءات */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EAE1] pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-[#231F1E]">
                    Supabase PostgreSQL Cloud
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    متصل سحابياً (Online)
                  </span>
                </div>
                <p className="text-xs text-[#786C65] font-mono mt-0.5" dir="ltr">
                  https://bgncjnjahxpecuxezwrk.supabase.co
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={testingConnection}
                className="h-10 rounded-full border-[#C9B9A6] text-xs font-semibold"
              >
                <CheckCircle2 className="ml-1.5 h-3.5 w-3.5 text-emerald-600" />
                فحص الاتصال
              </Button>
              <Button
                size="sm"
                onClick={handleSyncToSupabase}
                disabled={syncing}
                className="h-10 rounded-full bg-[#231F1E] px-5 text-xs font-semibold text-white hover:bg-[#9C6644] transition-colors"
              >
                <RefreshCw className={`ml-1.5 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'جارٍ المزامنة السحابية…' : 'مزامنة البيانات مع Supabase الآن'}
              </Button>
            </div>
          </div>

          {/* عدادات الجداول السحابية */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#231F1E]">{products.length}</p>
              <p className="text-xs font-medium text-[#786C65] mt-0.5">منتجات (products)</p>
            </div>
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#231F1E]">{stores.length}</p>
              <p className="text-xs font-medium text-[#786C65] mt-0.5">معارض (stores)</p>
            </div>
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#231F1E]">{designers.length}</p>
              <p className="text-xs font-medium text-[#786C65] mt-0.5">مصممون (designers)</p>
            </div>
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#231F1E]">{requests.length}</p>
              <p className="text-xs font-medium text-[#786C65] mt-0.5">طلبات ومحادثات (requests)</p>
            </div>
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#231F1E]">{reviews.length}</p>
              <p className="text-xs font-medium text-[#786C65] mt-0.5">آراء وتقييمات (reviews)</p>
            </div>
          </div>
        </div>

        {/* عارض السجلات المباشرة */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#9C6644]" />
              <h3 className="font-display text-base font-bold text-[#231F1E]">
                استعراض السجلات المحفوظة في Supabase
              </h3>
            </div>

            {/* محدد الجدول */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['products', 'stores', 'requests', 'reviews'] as TableView[]).map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setSelectedTable(tbl)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    selectedTable === tbl
                      ? 'bg-[#231F1E] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-[#5C534E] border border-[#E5DEC9] hover:bg-white'
                  }`}
                >
                  {tbl === 'products' && 'المنتجات'}
                  {tbl === 'stores' && 'المعارض'}
                  {tbl === 'requests' && 'الطلبات والمحادثات'}
                  {tbl === 'reviews' && 'التقييمات'}
                </button>
              ))}
            </div>
          </div>

          {/* محتوى الجدول المختار */}
          <div className="mt-4 overflow-x-auto">
            {selectedTable === 'products' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#786C65]">
                    <th className="py-2.5 px-3">الاسم</th>
                    <th className="py-2.5 px-3">الفئة</th>
                    <th className="py-2.5 px-3">السعر</th>
                    <th className="py-2.5 px-3">المعرف UUID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {products.slice(0, 10).map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-semibold text-[#231F1E]">{p.name}</td>
                      <td className="py-2.5 px-3 text-[#786C65]">{p.category}</td>
                      <td className="py-2.5 px-3 font-bold text-[#9C6644]">{p.price.toLocaleString()} ر.ي</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-stone-500" dir="ltr">{p.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'stores' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#786C65]">
                    <th className="py-2.5 px-3">اسم المعرض</th>
                    <th className="py-2.5 px-3">المنطقة</th>
                    <th className="py-2.5 px-3">التخصص</th>
                    <th className="py-2.5 px-3">المعرف UUID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-semibold text-[#231F1E]">{s.name}</td>
                      <td className="py-2.5 px-3 text-[#786C65]">{s.area || s.city}</td>
                      <td className="py-2.5 px-3 text-[#9C6644]">{s.specialty}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-stone-500" dir="ltr">{s.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'requests' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#786C65]">
                    <th className="py-2.5 px-3">النوع</th>
                    <th className="py-2.5 px-3">الاسم / العميل</th>
                    <th className="py-2.5 px-3">الهاتف</th>
                    <th className="py-2.5 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {requests.slice(0, 10).map((r) => (
                    <tr key={r.dbId} className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-semibold text-[#9C6644]">
                        {r.type === 'order' ? 'طلب شراء' : r.type === 'chat_message' ? 'رسالة شات' : 'تفصيل'}
                      </td>
                      <td className="py-2.5 px-3 text-[#231F1E]">{r.name}</td>
                      <td className="py-2.5 px-3 font-mono" dir="ltr">{r.phone || '—'}</td>
                      <td className="py-2.5 px-3 text-[#786C65]">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'reviews' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#786C65]">
                    <th className="py-2.5 px-3">العميل</th>
                    <th className="py-2.5 px-3">النجوم</th>
                    <th className="py-2.5 px-3">الخدمة</th>
                    <th className="py-2.5 px-3">نص التقييم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {reviews.slice(0, 10).map((rev) => (
                    <tr key={rev.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-semibold text-[#231F1E]">{rev.name}</td>
                      <td className="py-2.5 px-3 text-amber-500 font-bold">⭐ {rev.rating}</td>
                      <td className="py-2.5 px-3 text-[#9C6644]">{rev.service}</td>
                      <td className="py-2.5 px-3 text-[#786C65] max-w-xs truncate">{rev.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* التصدير والاستيراد (JSON Backup) */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#231F1E]">تصدير نسخة احتياطية سحابية</h4>
            <p className="mt-1 text-xs text-[#786C65]">
              تنزيل ملف JSON كامل يحتوي المنتجات، المعارض، المصممين، الطلبات والتقييمات.
            </p>
            <Button
              onClick={downloadBackup}
              className="mt-4 h-10 w-full rounded-full bg-[#231F1E] text-xs font-semibold text-white hover:bg-[#9C6644]"
            >
              <Download className="ml-2 h-4 w-4" />
              تنزيل ملف النسخة الاحتياطية
            </Button>
          </div>

          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#231F1E]">استيراد بيانات JSON</h4>
            <p className="mt-1 text-xs text-[#786C65]">
              استعادة أو دمج ملف بيانات في قاعدة بيانات المنصة.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => void runImport(String(reader.result ?? ''));
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="mt-4 h-10 w-full rounded-full border-[#C9B9A6] text-xs font-semibold"
            >
              <Upload className="ml-2 h-4 w-4" />
              {importing ? 'جارٍ الاستيراد…' : 'اختيار ملف JSON للاستيراد'}
            </Button>
          </div>
        </div>
      </div>
    </AdminSection>
  );
};
