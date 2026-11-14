import { useMemo, useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
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
import { Label } from '@/components/ui/label';
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

const ReviewsPage = () => {
  const { reviews, stores, designers, createReview } = useCatalog();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState(areas[0]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [service, setService] = useState('');
  const [saving, setSaving] = useState(false);

  const approved = useMemo(() => reviews.filter((review) => review.approved), [reviews]);
  const average = approved.length
    ? approved.reduce((total, review) => total + review.rating, 0) / approved.length
    : 0;

  const serviceOptions = [
    ...stores.map((store) => store.name),
    ...designers.map((designer) => designer.name),
    'مصمم الذكاء الاصطناعي',
    'خدمة التوصيل والتركيب',
  ];

  const submit = async () => {
    if (!name.trim() || !text.trim() || !service) {
      toast.error('الاسم ونص التجربة والخدمة مطلوبة');
      return;
    }
    setSaving(true);
    try {
      await createReview({
        name: name.trim(),
        area,
        rating,
        text: text.trim(),
        service,
        approved: true,
      });
      toast.success('شكراً لمشاركة تجربتك');
      setOpen(false);
      setName('');
      setText('');
      setService('');
      setRating(5);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر إضافة التقييم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="آراء العملاء — إيوان المكلا"
        description="تجارب وتقييمات عملاء إيوان في المكلا، حضرموت."
      />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">آراء العملاء</p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
                تجارب حقيقية من بيوت المكلا
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        'h-4 w-4',
                        index < Math.round(average) ? 'fill-accent text-accent' : 'text-border',
                      )}
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {average.toFixed(1)} من {approved.length} تقييم
                </span>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="h-11 shrink-0 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
              أضف تقييمك
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {approved.map((review) => (
            <figure
              key={review.dbId || review.id}
              className="flex h-full flex-col rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'h-3.5 w-3.5',
                      index < review.rating ? 'fill-accent text-accent' : 'text-border',
                    )}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed">
                {review.text}
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-medium">{review.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {review.area} · {review.service}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl border-border bg-background sm:rounded-3xl md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">شاركنا تجربتك</DialogTitle>
            <DialogDescription className="text-pretty text-sm text-muted-foreground">
              رأيك يساعد غيرك على اختيار المعرض أو المصمم المناسب.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="review-name">الاسم</Label>
              <Input
                id="review-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="اسمك الكامل"
                className="h-11 rounded-xl border-border px-3 text-base"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>الحي في المكلا</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الخدمة أو المعرض</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="h-11 rounded-xl border-border px-3 text-base">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>تقييمك</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${index + 1} نجوم`}
                    onClick={() => setRating(index + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
                  >
                    <Star
                      className={cn(
                        'h-5 w-5',
                        index < rating ? 'fill-accent text-accent' : 'text-border',
                      )}
                      strokeWidth={0}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-text">نص التجربة</Label>
              <Textarea
                id="review-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="حدّثنا عن تجربتك مع المعرض أو المصمم…"
                rows={4}
                className="rounded-xl border-border px-3 text-base"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 rounded-full border-border px-5"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => void submit()}
              disabled={saving}
              className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {saving ? 'جارٍ النشر…' : 'نشر التقييم'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewsPage;
