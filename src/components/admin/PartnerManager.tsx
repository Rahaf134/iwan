import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
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
import { useCatalog } from '@/contexts/CatalogContext';
import type { PartnerInput, PartnerRecord } from '@/lib/catalogApi';

const icons = [
  { value: 'store', label: 'معرض' },
  { value: 'sofa', label: 'أثاث' },
  { value: 'hammer', label: 'ورشة' },
  { value: 'ruler', label: 'هندسة' },
  { value: 'truck', label: 'توصيل' },
  { value: 'lamp', label: 'إضاءة' },
];

const emptyForm = { name: '', type: '', description: '', icon: 'store' };
type FormState = typeof emptyForm;

export const PartnerManager = () => {
  const { partners, createPartner, updatePartner, removePartner } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (partner: PartnerRecord) => {
    setEditing(partner);
    setForm({ name: partner.name, type: partner.type, description: partner.description, icon: partner.icon });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.type.trim()) {
      toast.error('اسم الشريك ونوع الشراكة مطلوبان');
      return;
    }
    const input: PartnerInput = {
      name: form.name.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      icon: form.icon,
    };
    setSaving(true);
    try {
      if (editing) await updatePartner(editing.dbId, input);
      else await createPartner(input);
      toast.success(editing ? 'تم تحديث الشريك' : 'تمت إضافة الشريك');
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSection
      title="إدارة شركاء النجاح"
      description={`${partners.length} شريك موثّق.`}
      action={
        <Button onClick={openCreate} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          شريك جديد
        </Button>
      }
    >
      {partners.length === 0 ? (
        <AdminEmpty message="لا يوجد شركاء بعد." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {partners.map((partner) => (
            <div key={partner.dbId} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{partner.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{partner.type}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label="تعديل" onClick={() => openEdit(partner)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" strokeWidth={1.6} />
                  </Button>
                  <DeleteButton onConfirm={() => void removePartner(partner.dbId)} />
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{partner.description}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? 'تعديل الشريك' : 'شريك جديد'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              يظهر الشريك في صفحة شركاء النجاح.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <AdminField label="اسم الشريك" htmlFor="pt-name">
              <Input id="pt-name" value={form.name} onChange={(event) => set('name', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="نوع الشراكة" htmlFor="pt-type">
              <Input id="pt-type" value={form.type} onChange={(event) => set('type', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الأيقونة">
              <Select value={form.icon} onValueChange={(value) => set('icon', value)}>
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="الوصف" htmlFor="pt-desc">
              <Textarea id="pt-desc" value={form.description} onChange={(event) => set('description', event.target.value)} rows={3} className="rounded-xl border-border px-3 text-base" />
            </AdminField>
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
