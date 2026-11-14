import { useMemo } from 'react';
import { AdminEmpty, AdminSection, DeleteButton } from '@/components/admin/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCatalog } from '@/contexts/CatalogContext';
import { useAuth } from '@/contexts/AuthContext';
import type { RequestRecordFull } from '@/lib/catalogApi';
import { formatPrice } from '@/data/catalog';
import { parseOrderDetails } from '@/lib/order';

const statusLabels: Record<RequestRecordFull['status'], string> = {
  new: 'تم تأكيد الطلب',
  contacted: 'قيد التجهيز بالمعرض',
  processing: 'خرج للتوصيل',
  done: 'تم التسليم',
};

export const RequestManager = () => {
  const { requests, setRequestStatus, removeRequest } = useCatalog();
  const { profile, isProvider } = useAuth();

  // فلترة وتنقية الطلبات واستبعاد رسائل الشات والأسماء الوهمية أو الأسعار الصفرية
  const validOrders = useMemo(() => {
    return requests.filter((r) => {
      // 1. استبعاد سجلات الشات واللوك بوك
      if (r.type === 'chat_message' || r.type === 'lookbook_item') return false;
      if (!r.status) return false;

      const order = parseOrderDetails(r.details, r.phone, r.name);

      // 2. استبعاد السجلات التي سعرها 0 أو مفقود
      if (!order || !order.price || order.price <= 0) return false;

      // 3. استبعاد السجلات التي اسم العميل فيها هو اسم مصمم أو آدمن
      const clientName = (order.customerName || r.name || '').trim();
      const lower = clientName.toLowerCase();
      if (
        lower.includes('ريم الكثيري') ||
        lower.includes('رحاف') ||
        lower.includes('مديرة المنصة') ||
        lower.includes('المزود') ||
        lower === 'إيوان'
      ) {
        return false;
      }

      // 4. إذا كان المسجل مزوداً: عرض طلبات متجره فقط
      if (isProvider && profile?.storeId) {
        if (order.storeId && order.storeId === profile.storeId) return true;
        if (profile.businessName && order.storeName && order.storeName.includes(profile.businessName)) {
          return true;
        }
        return false;
      }

      return true;
    });
  }, [requests, isProvider, profile]);

  return (
    <AdminSection
      title="الطلبات الواردة"
      description="طلبات شراء الأثاث المعتمدة المسجلة داخل المنصة."
    >
      {validOrders.length === 0 ? (
        <AdminEmpty message="لا توجد طلبات واردة بعد." />
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-sm">
          <table className="w-full text-right text-xs table-auto">
            <thead>
              <tr className="border-b border-[#E5DEC9] bg-[#F3EDE2] text-[#231F1E]">
                <th className="px-3.5 py-3 font-bold">العميل</th>
                <th className="px-3.5 py-3 font-bold">رقم الجوال</th>
                <th className="px-3.5 py-3 font-bold">القطعة والكمية</th>
                <th className="px-3.5 py-3 font-bold">المعرض</th>
                <th className="px-3.5 py-3 font-bold">الإجمالي والدفع</th>
                <th className="px-3.5 py-3 font-bold">التاريخ</th>
                <th className="px-3.5 py-3 font-bold">الحالة</th>
                <th className="px-3.5 py-3 font-bold text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]/60 text-[#231F1E]">
              {validOrders.map((request) => {
                const order = parseOrderDetails(request.details, request.phone, request.name);
                const clientName = order.customerName || request.name || 'عميل إيوان';
                const clientPhone = request.phone || order.phone || '—';

                return (
                  <tr key={request.dbId} className="hover:bg-[#F3EDE2]/40 transition-colors">
                    {/* 1. العميل (بدون تكرار الرقم تحته) */}
                    <td className="px-3.5 py-3 font-bold text-[#231F1E] whitespace-nowrap">
                      {clientName}
                    </td>

                    {/* 2. رقم الجوال (نص هادئ ونظيف بدون أيقونات ملونة فاقعة) */}
                    <td className="px-3.5 py-3 font-mono text-[#5C534E] whitespace-nowrap" dir="ltr">
                      {clientPhone}
                    </td>

                    {/* 3. القطعة والكمية */}
                    <td className="px-3.5 py-3">
                      <p className="font-semibold text-[#231F1E] line-clamp-1">
                        {order.productName || 'طلب أثاث'}
                      </p>
                      <span className="text-[11px] text-[#786C65]">
                        × {order.quantity || 1} قطعة
                      </span>
                    </td>

                    {/* 4. المعرض */}
                    <td className="px-3.5 py-3 font-semibold text-[#9C6644] whitespace-nowrap">
                      {order.storeName || 'معارض إيوان'}
                    </td>

                    {/* 5. الإجمالي والدفع */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <p className="font-bold text-[#9C6644] font-mono">
                        {formatPrice(order.price)}
                      </p>
                      <span className="text-[10px] text-[#786C65] block mt-0.5">
                        {order.paymentLabel || order.paymentMethod || 'عند الاستلام'}
                      </span>
                    </td>

                    {/* 6. التاريخ */}
                    <td className="px-3.5 py-3 text-[#786C65] font-mono text-[11px] whitespace-nowrap">
                      {new Date(order.date || request.createdAt || Date.now()).toLocaleDateString('ar-YE')}
                    </td>

                    {/* 7. الحالة */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <Select
                        value={request.status}
                        onValueChange={(value) =>
                          void setRequestStatus(request.dbId, value as RequestRecordFull['status'])
                        }
                      >
                        <SelectTrigger className="h-8 w-32 rounded-full border-[#DED4C6] bg-[#FAF7F2] text-[11px] font-bold text-[#231F1E]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="text-xs">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* 8. حذف */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      <DeleteButton onConfirm={() => void removeRequest(request.dbId)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
};
