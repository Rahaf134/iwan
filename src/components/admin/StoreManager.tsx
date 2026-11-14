import { useState } from 'react';
import { Check, Clock, Pencil, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AdminEmpty, AdminField, AdminSection, DeleteButton } from '@/components/admin/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { useCatalog } from '@/contexts/CatalogContext';
import { areas } from '@/data/catalog';
import type { ApprovalStatus, StoreInput, StoreRecord } from '@/lib/catalogApi';
import { cn } from '@/lib/utils';

const emptyForm = {
  name: '',
  area: areas[0],
  specialty: '',
  phone: '',
  rating: '4.8',
  imageUrl: '',
  description: '',
  verified: true,
  approvalStatus: 'approved' as ApprovalStatus,
};

type FormState = typeof emptyForm;

export const StoreManager = () => {
  const { stores, createStore, updateStore, removeStore } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StoreRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (store: StoreRecord) => {
    setEditing(store);
    const status: ApprovalStatus = store.approvalStatus || (store.verified ? 'approved' : 'pending');
    setForm({
      name: store.name,
      area: store.area,
      specialty: store.specialty,
      phone: store.phone,
      rating: String(store.rating),
      imageUrl: store.imageUrl,
      description: store.description,
      verified: status === 'approved',
      approvalStatus: status,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.specialty.trim()) {
      toast.error('اسم المعرض والتخصص مطلوبان');
      return;
    }
    const isApproved = form.approvalStatus === 'approved';
    const input: StoreInput = {
      name: form.name.trim(),
      city: 'المكلا',
      area: form.area,
      address: `المكلا — ${form.area}`,
      specialty: form.specialty.trim(),
      phone: form.phone.trim(),
      rating: Number(form.rating) || 4.5,
      verified: isApproved,
      approvalStatus: form.approvalStatus,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || editing?.imageUrl || '',
    };

    setSaving(true);
    try {
      if (editing) await updateStore(editing.dbId, input);
      else await createStore(input);
      toast.success(editing ? 'تم تحديث المعرض' : 'تمت إضافة المعرض');
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (store: StoreRecord, nextStatus: ApprovalStatus) => {
    try {
      await updateStore(store.dbId, {
        name: store.name,
        city: store.city || 'المكلا',
        area: store.area,
        address: `المكلا — ${store.area}`,
        specialty: store.specialty,
        phone: store.phone,
        rating: store.rating,
        verified: nextStatus === 'approved',
        approvalStatus: nextStatus,
        description: store.description,
        imageUrl: store.imageUrl,
      });
      const label =
        nextStatus === 'approved' ? 'معتمد' : nextStatus === 'pending' ? 'قيد المراجعة' : 'مرفوض / متوقف';
      toast.success(`تم تحديث حالة ${store.name} إلى: ${label}`);
    } catch {
      // Safe silent catch
    }
  };

  return (
    <AdminSection
      title="إدارة ومراجعة المعارض"
      description={`${stores.length} معرض مسجل في المكلا — مراجعة واعتماد وتعديل البيانات.`}
      action={
        <Button onClick={openCreate} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          معرض جديد
        </Button>
      }
    >
      {stores.length === 0 ? (
        <AdminEmpty message="لا توجد معارض بعد." />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-3 font-medium">المعرض</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">الحي</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">التخصص</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">الهاتف</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">حالة الاعتماد</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">التقييم</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const status: ApprovalStatus =
                  store.approvalStatus || (store.verified ? 'approved' : 'pending');
                return (
                  <tr key={store.dbId} className="border-b border-border last:border-0 hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {store.imageUrl && <img src={store.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="max-w-56 truncate font-medium text-[#231F1E]">{store.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{store.area}</td>
                    <td className="max-w-64 truncate whitespace-nowrap px-4 py-3 text-muted-foreground">{store.specialty}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground" dir="ltr">{store.phone}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Select
                        value={status}
                        onValueChange={(val) => void handleStatusChange(store, val as ApprovalStatus)}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-7 w-auto min-w-[128px] rounded-full px-2.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs transition-colors border',
                            status === 'approved' &&
                              'bg-[#EFE7DA] text-[#231F1E] border-[#D8CBB8] hover:bg-[#E5DCCB]',
                            status === 'pending' &&
                              'bg-[#FAF7F2] text-[#7A6F68] border-[#E5DEC9] hover:bg-[#F3EDE2]',
                            status === 'rejected' &&
                              'bg-[#F4E8E3] text-[#8C4A32] border-[#E2C9BE] hover:bg-[#EEDCD3]',
                          )}
                        >
                          {status === 'approved' && <Check className="h-3.5 w-3.5 text-[#9C6644] shrink-0" />}
                          {status === 'pending' && <Clock className="h-3.5 w-3.5 text-[#7A6F68] shrink-0" />}
                          {status === 'rejected' && <X className="h-3.5 w-3.5 text-[#8C4A32] shrink-0" />}
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2] p-1 shadow-lg">
                          <SelectItem
                            value="approved"
                            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#231F1E] focus:bg-[#EFE7DA] focus:text-[#231F1E] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-[#9C6644]" />
                              <span>معتمد</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="pending"
                            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#7A6F68] focus:bg-[#F3EDE2] focus:text-[#231F1E] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-[#7A6F68]" />
                              <span>قيد المراجعة</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="rejected"
                            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#8C4A32] focus:bg-[#F4E8E3] focus:text-[#8C4A32] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <X className="h-3.5 w-3.5 text-[#8C4A32]" />
                              <span>مرفوض / متوقف</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{store.rating.toFixed(1)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="تعديل" onClick={() => openEdit(store)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" strokeWidth={1.6} />
                        </Button>
                        <DeleteButton onConfirm={() => void removeStore(store.dbId)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-border bg-background md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? 'تعديل المعرض' : 'معرض جديد'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              يظهر المعرض فوراً في دليل المعارض وصفحة المنتجات.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <AdminField label="اسم المعرض" htmlFor="s-name">
              <Input id="s-name" value={form.name} onChange={(event) => set('name', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الحي">
              <Select value={form.area} onValueChange={(value) => set('area', value)}>
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="التخصص" htmlFor="s-spec">
              <Input id="s-spec" value={form.specialty} onChange={(event) => set('specialty', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الهاتف" htmlFor="s-phone">
              <Input id="s-phone" value={form.phone} onChange={(event) => set('phone', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="التقييم" htmlFor="s-rating">
              <Input id="s-rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(event) => set('rating', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="حالة الاعتماد">
              <Select
                value={form.approvalStatus}
                onValueChange={(value) => {
                  set('approvalStatus', value as ApprovalStatus);
                  set('verified', value === 'approved');
                }}
              >
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-[#E5DEC9] bg-[#FAF7F2]">
                  <SelectItem value="approved">معتمد</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="rejected">مرفوض / متوقف</SelectItem>
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="رابط الصورة" htmlFor="s-image">
              <ImageUploadField
                value={form.imageUrl}
                onChange={(value) => set('imageUrl', value)}
                label="صورة / شعار المعرض"
                hint="صورة واجهة المعرض أو شعاره"
              />
            </AdminField>
            <div className="md:col-span-2">
              <AdminField label="الوصف" htmlFor="s-desc">
                <Textarea id="s-desc" value={form.description} onChange={(event) => set('description', event.target.value)} rows={3} className="rounded-xl border-border px-3 text-base" />
              </AdminField>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-full border-border px-5">إلغاء</Button>
            <Button onClick={() => void submit()} disabled={saving} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSection>
  );
};
