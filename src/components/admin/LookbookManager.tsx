import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminEmpty, AdminSection } from '@/components/admin/shared';
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
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { useCatalog } from '@/contexts/CatalogContext';

const emptyForm = {
  title: '',
  area: '',
  style: '',
  image: '',
  description: '',
};

export const LookbookManager = () => {
  const { lookbookItems, createLookbookItem, removeLookbookItem } = useCatalog();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof emptyForm, val: string) =>
    setForm((current) => ({ ...current, [key]: val }));

  const submit = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('العنوان وصورة الإلهام مطلوبة');
      return;
    }
    setSaving(true);
    try {
      await createLookbookItem({
        title: form.title.trim(),
        area: form.area.trim() || 'المكلا',
        style: form.style.trim() || 'حضرمي معاصر',
        image: form.image.trim(),
        description: form.description.trim() || 'إلهام تصميم داخلي عصري بأثاث محلي.',
      });
      toast.success('تمت إضافة الإلهام بنجاح وحفظه في Supabase');
      setOpen(false);
      setForm(emptyForm);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر حفظ الإلهام');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dbId?: string) => {
    if (!dbId) {
      toast.info('هذا العنصر هو إلهام افتراضي من النظام ولا يمكن حذفه.');
      return;
    }
    try {
      await removeLookbookItem(dbId);
      toast.success('تم حذف الإلهام من قاعدة البيانات');
    } catch {
      toast.error('تعذّر حذف الإلهام');
    }
  };

  return (
    <AdminSection
      title="كتالوج الإلهام (Lookbook)"
      description="إدارة مساحات وتصاميم كتالوج الإلهام المربوطة سحابياً في Supabase."
      action={
        <Button
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
          className="h-10 rounded-full bg-primary px-5 text-xs text-primary-foreground"
        >
          <Plus className="ml-1.5 h-4 w-4" />
          إضافة إلهام جديد
        </Button>
      }
    >
      {lookbookItems.length === 0 ? (
        <AdminEmpty message="لا توجد مساحات إلهام بعد." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lookbookItems.map((item) => (
            <div
              key={item.dbId || item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#E5DEC9] bg-white shadow-xs"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                <span className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                  {item.area} · {item.style}
                </span>
                {item.dbId && (
                  <span className="absolute top-2 left-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] text-white font-bold">
                    Supabase Live
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold text-[#231F1E]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-[#6B5E55] leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-auto pt-3 border-t border-[#F0EAE1] flex justify-end">
                  {item.dbId ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.dbId)}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="ml-1 h-3.5 w-3.5" />
                      حذف الإلهام
                    </Button>
                  ) : (
                    <span className="text-[11px] text-[#8C7D73] font-medium">عنصر أساسي</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة إلهام */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background p-6 md:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">إضافة مساحة إلهام جديدة</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              تُحفظ مباشرة في قاعدة بيانات Supabase وتظهر للزوار في كتالوج الإلهام والصفحة الرئيسية.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-right">
            <div>
              <label className="text-xs font-semibold">عنوان المساحة</label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="مثال: مجلس حضرمي في فوة"
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold">المنطقة / الحي</label>
                <Input
                  value={form.area}
                  onChange={(e) => set('area', e.target.value)}
                  placeholder="مثال: فوة، الديس"
                  className="mt-1 h-10 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">الستايل</label>
                <Input
                  value={form.style}
                  onChange={(e) => set('style', e.target.value)}
                  placeholder="مثال: نيوكلاسيك، مودرن دافئ"
                  className="mt-1 h-10 rounded-xl"
                />
              </div>
            </div>

            <ImageUploadField
              label="صورة الإلهام"
              hint="ارفع صورة عالية الجودة للمساحة — تُحفظ تلقائياً في قاعدة البيانات"
              value={form.image}
              onChange={(img) => set('image', img)}
            />

            <div>
              <label className="text-xs font-semibold">الوصف</label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="تفاصيل التوزيع، خامات الأقمشة، وتناغم الألوان..."
                rows={3}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
              إلغاء
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="rounded-full bg-primary px-6 text-primary-foreground"
            >
              {saving ? 'جارٍ الحفظ…' : 'حفظ في Supabase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSection>
  );
};
