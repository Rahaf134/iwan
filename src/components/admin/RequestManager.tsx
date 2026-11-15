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
import { cn } from '@/lib/utils';

const adminSelectableStatuses = [
  { value: 'new', label: 'تم تأكيد الطلب' },
  { value: 'processing', label: 'قيد التجهيز بالمعرض' },
  { value: 'shipping', label: 'خرج للتوصيل' },
  { value: 'done', label: 'تم التسليم' },
];

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
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
          <table className="w-full text-right text-xs table-auto">
            <thead>
              <tr className="border-b border-border bg-card text-stone-700">
                <th className="px-3.5 py-3 font-medium">العميل</th>
                <th className="px-3.5 py-3 font-medium">رقم الجوال</th>
                <th className="px-3.5 py-3 font-medium">القطعة والكمية</th>
                <th className="px-3.5 py-3 font-medium">المعرض</th>
                <th className="px-3.5 py-3 font-medium">الإجمالي والدفع</th>
                <th className="px-3.5 py-3 font-medium">التاريخ</th>
                <th className="px-3.5 py-3 font-medium">الحالة</th>
                <th className="px-3.5 py-3 font-medium text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-stone-700">
              {validOrders.map((request) => {
                const order = parseOrderDetails(request.details, request.phone, request.name);
                const clientName = order.customerName || request.name || 'عميل إيوان';
                const clientPhone = request.phone || order.phone || '—';

                return (
                  <tr key={request.dbId} className="hover:bg-background/40 transition-colors">
                    {/* 1. العميل */}
                    <td className="px-3.5 py-3 font-medium text-stone-800 whitespace-nowrap">
                      {clientName}
                    </td>

                    {/* 2. رقم الجوال */}
                    <td className="px-3.5 py-3 font-normal text-stone-600 whitespace-nowrap font-display" dir="ltr">
                      {clientPhone}
                    </td>

                    {/* 3. القطعة والكمية */}
                    <td className="px-3.5 py-3 max-w-[220px]">
                      <p className="font-medium text-stone-800 line-clamp-2 leading-relaxed">
                        {order.productName || 'طلب أثاث'}
                      </p>
                      <span className="text-[11px] text-stone-500 block mt-0.5 font-display">
                        × {order.quantity || 1} قطعة
                      </span>
                    </td>

                    {/* 4. المعرض */}
                    <td className="px-3.5 py-3 font-medium text-stone-700 whitespace-nowrap">
                      {order.storeName || 'معارض إيوان'}
                    </td>

                    {/* 5. الإجمالي والدفع */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <p className="font-display text-base text-stone-800">
                        {formatPrice(order.price)}
                      </p>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        {order.paymentLabel || order.paymentMethod || 'عند الاستلام'}
                      </span>
                    </td>

                    {/* 6. التاريخ */}
                    <td className="px-3.5 py-3 text-stone-500 text-[11px] whitespace-nowrap font-display">
                      {new Date(order.date || request.createdAt || Date.now()).toLocaleDateString('ar-YE')}
                    </td>

                    {/* 7. الحالة بتصميم Casa الدافئ */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {(() => {
                        const normalizedStatus =
                          request.status === 'contacted' ? 'processing' :
                          request.status === 'in_progress' ? 'shipping' :
                          request.status === 'confirmed' ? 'new' :
                          request.status === 'delivered' ? 'done' :
                          request.status || 'new';

                        return (
                          <Select
                            value={normalizedStatus}
                            onValueChange={(value) =>
                              void setRequestStatus(request.dbId, value as RequestRecordFull['status'])
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-7.5 w-auto min-w-[130px] rounded-full px-2.5 text-[11px] font-bold border transition-colors cursor-pointer',
                                normalizedStatus === 'done' &&
                                  'bg-[#EFE7DA] text-[#231F1E] border-[#D8CBB8] hover:bg-[#E5DCCB]',
                                normalizedStatus === 'shipping' &&
                                  'bg-[#F3EDE2] text-[#9C6644] border-[#DED4C6] hover:bg-[#EAE0D1]',
                                normalizedStatus === 'processing' &&
                                  'bg-[#FAF7F2] text-[#9C6644] border-[#E5DEC9] hover:bg-[#F3EDE2]',
                                normalizedStatus === 'new' &&
                                  'bg-[#FAF7F2] text-[#231F1E] border-[#DED4C6] hover:bg-[#F3EDE2]',
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2] p-1 shadow-md">
                              {adminSelectableStatuses.map((item) => (
                                <SelectItem key={item.value} value={item.value} className="text-xs font-semibold cursor-pointer">
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      })()}
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
