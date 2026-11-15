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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { useCatalog } from '@/contexts/CatalogContext';
import { categories, formatPrice } from '@/data/catalog';
import { slugify, toValidStoreUuid, type ProductInput, type ProductRecord, type StoreRecord } from '@/lib/catalogApi';

const emptyForm = {
  name: '',
  price: '',
  storeId: '',
  category: categories[0]?.name ?? '',
  image: '',
  dimensions: '',
  materials: '',
  colors: '',
  description: '',
  badge: '',
  available: true,
  featured: false,
};

type FormState = typeof emptyForm;

const toForm = (product: ProductRecord, storeList: StoreRecord[]): FormState => {
  const matched = storeList.find(
    (s) => s.id === product.storeId || s.dbId === product.storeId || s.legacyId === product.storeId || s.dbId === product.storeDbId,
  );
  const resolvedStoreId = matched?.id || matched?.dbId || toValidStoreUuid(product.storeDbId || product.storeId);
  return {
    name: product.name,
    price: String(product.price),
    storeId: resolvedStoreId,
    category: product.category,
    image: product.images[0] ?? '',
    dimensions: product.dimensions,
    materials: product.materials.join('، '),
    colors: product.colors.map((color) => `${color.name}:${color.hex}`).join('، '),
    description: product.description,
    badge: product.badge ?? '',
    available: product.available,
    featured: Boolean(product.featured),
  };
};

const parseColors = (value: string) =>
  value
    .split(/[،,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, hex] = entry.split(':');
      return { name: (name ?? '').trim(), hex: (hex ?? '#EFE9DF').trim() };
    });

export const ProductManager = () => {
  const { products, stores, createProduct, updateProduct, removeProduct } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    const initialStore = stores[0];
    const initialStoreId = initialStore?.id || initialStore?.dbId || toValidStoreUuid('s1');
    setForm({ ...emptyForm, storeId: initialStoreId });
    setOpen(true);
  };

  const openEdit = (product: ProductRecord) => {
    setEditing(product);
    setForm(toForm(product, stores));
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price || !form.storeId) {
      toast.error('الاسم والسعر والمعرض مطلوبة');
      return;
    }
    const finalStoreId = toValidStoreUuid(form.storeId);
    const input: ProductInput = {
      name: form.name.trim(),
      slug: editing?.slug && editing.slug !== '-' ? editing.slug : slugify(form.name),
      category: form.category,
      price: Number(form.price),
      compareAt: null,
      description: form.description.trim(),
      dimensions: form.dimensions.trim(),
      care: editing?.care ?? 'مسح بقطعة قماش جافة، وتجنّب أشعة الشمس المباشرة.',
      materials: form.materials.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
      colors: parseColors(form.colors),
      images: form.image.trim() ? [form.image.trim()] : editing?.images ?? [],
      badge: form.badge.trim() || null,
      featured: form.featured,
      available: form.available,
      storeId: finalStoreId,
    };

    setSaving(true);
    try {
      if (editing) await updateProduct(editing.dbId, input);
      else await createProduct(input);
      toast.success(editing ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSection
      title="إدارة المنتجات"
      description={`${products.length} قطعة معروضة — الأسعار بالريال اليمني.`}
      action={
        <Button onClick={openCreate} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          منتج جديد
        </Button>
      }
    >
      {products.length === 0 ? (
        <AdminEmpty message="لا توجد منتجات بعد." />
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-3 font-medium">المنتج</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">المعرض</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">الفئة</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">السعر</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">التوفر</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.dbId} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {product.images[0] && (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="max-w-56 truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {stores.find((store) => store.id === product.storeId || store.dbId === product.storeId || store.legacyId === product.storeId)?.name ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{product.category}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={product.available ? 'text-foreground' : 'text-muted-foreground'}>
                      {product.available ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="تعديل"
                        onClick={() => openEdit(product)}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.6} />
                      </Button>
                      <DeleteButton onConfirm={() => void removeProduct(product.dbId)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-border bg-background md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? 'تعديل المنتج' : 'منتج جديد'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              تظهر التعديلات فوراً في المتجر وصفحة المنتج.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <AdminField label="اسم المنتج" htmlFor="p-name">
              <Input id="p-name" value={form.name} onChange={(event) => set('name', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="السعر (ر.ي)" htmlFor="p-price">
              <Input id="p-price" type="number" value={form.price} onChange={(event) => set('price', event.target.value)} dir="ltr" className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="المعرض">
              <Select value={form.storeId} onValueChange={(value) => set('storeId', value)}>
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue placeholder="اختر المعرض" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => {
                    const storeVal = store.id || store.dbId || toValidStoreUuid(store.legacyId);
                    return (
                      <SelectItem key={storeVal} value={storeVal}>
                        {store.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="الفئة">
              <Select value={form.category} onValueChange={(value) => set('category', value)}>
                <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="رابط الصورة" htmlFor="p-image" hint="اتركه فارغاً للاحتفاظ بالصورة الحالية.">
              <ImageUploadField
                value={form.image}
                onChange={(value) => set('image', value)}
                label="صورة المنتج"
                hint="ارفع صورة واضحة بخلفية كريمية أو بيضاء ناعمة"
              />
            </AdminField>
            <AdminField label="المقاسات" htmlFor="p-dim">
              <Input id="p-dim" value={form.dimensions} onChange={(event) => set('dimensions', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الخامات" htmlFor="p-mat" hint="افصل بين الخامات بفاصلة.">
              <Input id="p-mat" value={form.materials} onChange={(event) => set('materials', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الألوان" htmlFor="p-colors" hint="الصيغة: الاسم:#HEX — مثال: بيج:#EFE9DF">
              <Input id="p-colors" value={form.colors} onChange={(event) => set('colors', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="شارة" htmlFor="p-badge">
              <Input id="p-badge" value={form.badge} onChange={(event) => set('badge', event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.available} onCheckedChange={(value) => set('available', value)} />
                متوفر
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.featured} onCheckedChange={(value) => set('featured', value)} />
                مميز
              </label>
            </div>
            <div className="md:col-span-2">
              <AdminField label="الوصف" htmlFor="p-desc">
                <Textarea id="p-desc" value={form.description} onChange={(event) => set('description', event.target.value)} rows={3} className="rounded-xl border-border px-3 text-base" />
              </AdminField>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-full border-border px-5">
              إلغاء
            </Button>
            <Button onClick={() => void submit()} disabled={saving} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSection>
  );
};
