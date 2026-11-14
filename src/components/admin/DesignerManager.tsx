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
import type { ApprovalStatus, DesignerInput, DesignerRecord } from '@/lib/catalogApi';
import { cn } from '@/lib/utils';

const emptyForm = {
  name: '',
  title: '',
  area: areas[0],
  years: '5',
  rating: '4.8',
  bio: '',
  imageUrl: '',
  portfolio: '',
  kind: 'designer' as 'designer' | 'carpenter',
  approvalStatus: 'approved' as ApprovalStatus,
};

type FormState = typeof emptyForm;

export const DesignerManager = () => {
  const { designers, createDesigner, updateDesigner, removeDesigner } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DesignerRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (designer: DesignerRecord) => {
    setEditing(designer);
    const status: ApprovalStatus = designer.approvalStatus || 'approved';
    setForm({
      name: designer.name,
      title: designer.title,
      area: designer.area,
      years: String(designer.years),
      rating: String(designer.rating),
      bio: designer.bio,
      imageUrl: designer.imageUrl,
      portfolio: designer.portfolio.join('، '),
      kind: designer.kind,
      approvalStatus: status,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.title.trim()) {
      toast.error('الاسم والمسمى المهني مطلوبان');
      return;
    }
    const input: DesignerInput = {
      name: form.name.trim(),
      title: form.title.trim(),
      area: form.area,
      years: Number(form.years) || 1,
      rating: Number(form.rating) || 4.5,
      bio: form.bio.trim(),
      imageUrl: form.imageUrl.trim() || editing?.imageUrl || '',
      portfolio: form.portfolio.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
      kind: form.kind,
      approvalStatus: form.approvalStatus,
    };

    setSaving(true);
    try {
      if (editing) await updateDesigner(editing.dbId, input);
      else await createDesigner(input);
      toast.success(editing ? 'تم تحديث البيانات' : 'تمت الإضافة');
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (designer: DesignerRecord, nextStatus: ApprovalStatus) => {
    try {
      await updateDesigner(designer.dbId, {
        name: designer.name,
        title: designer.title,
        area: designer.area,
        years: designer.years,
        rating: designer.rating,
        bio: designer.bio,
        imageUrl: designer.imageUrl,
        portfolio: designer.portfolio,
        kind: designer.kind,
        phone: designer.phone,
        approvalStatus: nextStatus,
      });
      const label =
        nextStatus === 'approved' ? 'معتمد' : nextStatus === 'pending' ? 'قيد المراجعة' : 'مرفوض / متوقف';
      toast.success(`تم تحديث حالة ${designer.name} إلى: ${label}`);
    } catch {
      // Safe silent catch
    }
  };

  return (
    <AdminSection
      title="إدارة المصممين والنجارين"
      description={`${designers.length} مصمم ونجار وورشة.`}
      action={
        <Button onClick={openCreate} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          إضافة
        </Button>
      }
    >
      {designers.length === 0 ? (
        <AdminEmpty message="لا يوجد مصممون بعد." />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-3 font-medium">الاسم</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">التخصص</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">النوع</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">الموقع</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">حالة الاعتماد</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">الخبرة</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">التقييم</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {designers.map((designer) => {
                const status: ApprovalStatus = designer.approvalStatus || 'approved';
                return (
                  <tr key={designer.dbId} className="border-b border-border last:border-0 hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                          {designer.imageUrl && <img src={designer.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="max-w-48 truncate font-medium text-[#231F1E]">{designer.name}</span>
                      </div>
                    </td>
                    <td className="max-w-56 truncate whitespace-nowrap px-4 py-3 text-muted-foreground">{designer.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {designer.kind === 'carpenter' ? 'نجار / ورشة' : 'مصمم'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{designer.area}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Select
                        value={status}
                        onValueChange={(val) => void handleStatusChange(designer, val as ApprovalStatus)}
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
                    <td className="whitespace-nowrap px-4 py-3">{designer.years} سنة</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{designer.rating.toFixed(1)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="تعديل" onClick={() => openEdit(designer)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" strokeWidth={1.6} />
                        </Button>
                        <DeleteButton onConfirm={() => void removeDesigner(designer.dbId)} />
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
            <DialogTitle className="font-display text-xl">{editing ? 'تعديل البيانات' : 'إضافة مصمم أو نجار'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              تظهر البيانات في صفحة المصممين والنجارين.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <AdminField label="الاسم" htmlFor="d-name">
              <Input id="d-name" value={form.name} onChange={(event) => set('name', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="المسمى المهني" htmlFor="d-title">
              <Input id="d-title" value={form.title} onChange={(event) => set('title', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="النوع">
              <Select value={form.kind} onValueChange={(value) => set('kind', value as 'designer' | 'carpenter')}>
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="designer">مصمم</SelectItem>
                  <SelectItem value="carpenter">نجار / ورشة</SelectItem>
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="الموقع">
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
            <AdminField label="حالة الاعتماد">
              <Select
                value={form.approvalStatus}
                onValueChange={(value) => set('approvalStatus', value as ApprovalStatus)}
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
            <AdminField label="سنوات الخبرة" htmlFor="d-years">
              <Input id="d-years" type="number" value={form.years} onChange={(event) => set('years', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="التقييم" htmlFor="d-rating">
              <Input id="d-rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(event) => set('rating', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="رابط الصورة" htmlFor="d-image">
              <ImageUploadField
                value={form.imageUrl}
                onChange={(value) => set('imageUrl', value)}
                label="الصورة الشخصية / صورة الأعمال"
                hint="صورة واضحة للمصمم أو نموذج من أعماله"
              />
            </AdminField>
            <AdminField label="نماذج الأعمال" htmlFor="d-portfolio" hint="روابط صور مفصولة بفاصلة.">
              <Input id="d-portfolio" value={form.portfolio} onChange={(event) => set('portfolio', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <div className="md:col-span-2">
              <AdminField label="نبذة" htmlFor="d-bio">
                <Textarea id="d-bio" value={form.bio} onChange={(event) => set('bio', event.target.value)} rows={3} className="rounded-xl border-border px-3 text-base" />
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
