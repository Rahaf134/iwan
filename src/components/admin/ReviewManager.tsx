import { useState } from 'react';
import { Check, Plus, Star, X } from 'lucide-react';
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
import { areas } from '@/data/catalog';
import { cn } from '@/lib/utils';

export const ReviewManager = () => {
  const { reviews, stores, createReview, updateReview, removeReview } = useCatalog();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState(areas[0]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [service, setService] = useState(stores[0]?.name ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !text.trim() || !service) {
      toast.error('الاسم والنص والخدمة مطلوبة');
      return;
    }
    setSaving(true);
    try {
      await createReview({ name: name.trim(), area, rating, text: text.trim(), service, approved: true });
      toast.success('تمت إضافة الرأي');
      setOpen(false);
      setName('');
      setText('');
      setRating(5);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSection
      title="إدارة آراء العملاء"
      description={`${reviews.length} رأي — يمكنك الموافقة أو الإخفاء أو الحذف.`}
      action={
        <Button onClick={() => setOpen(true)} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          رأي جديد
        </Button>
      }
    >
      {reviews.length === 0 ? (
        <AdminEmpty message="لا توجد آراء بعد." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.dbId} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{review.name}</p>
                    <span className="text-xs text-muted-foreground">{review.area}</span>
                    <span className="text-xs text-muted-foreground">· {review.service}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px]',
                        review.approved ? 'bg-secondary text-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {review.approved ? 'منشور' : 'مخفي'}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn('h-3 w-3', index < review.rating ? 'fill-accent text-accent' : 'text-border')}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={review.approved ? 'إخفاء' : 'موافقة'}
                    onClick={() =>
                      void updateReview(review.dbId, {
                        name: review.name,
                        area: review.area,
                        rating: review.rating,
                        text: review.text,
                        service: review.service,
                        approved: !review.approved,
                      })
                    }
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    {review.approved ? <X className="h-4 w-4" strokeWidth={1.6} /> : <Check className="h-4 w-4" strokeWidth={1.6} />}
                  </Button>
                  <DeleteButton onConfirm={() => void removeReview(review.dbId)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-border bg-background md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">إضافة رأي</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              يظهر الرأي فوراً في صفحة آراء العملاء.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <AdminField label="الاسم" htmlFor="r-name">
              <Input id="r-name" value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="الحي">
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminField>
              <AdminField label="الخدمة أو المعرض">
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.name}>{store.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminField>
            </div>
            <AdminField label="التقييم">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${index + 1} نجوم`}
                    onClick={() => setRating(index + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
                  >
                    <Star className={cn('h-5 w-5', index < rating ? 'fill-accent text-accent' : 'text-border')} strokeWidth={0} />
                  </button>
                ))}
              </div>
            </AdminField>
            <AdminField label="نص الرأي" htmlFor="r-text">
              <Textarea id="r-text" value={text} onChange={(event) => setText(event.target.value)} rows={4} className="rounded-xl border-border px-3 text-base" />
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
