import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCatalog } from '@/contexts/CatalogContext';
import { cn } from '@/lib/utils';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTarget?: string;
}

export const RatingModal = ({ open, onOpenChange, defaultTarget }: RatingModalProps) => {
  const { stores, designers, createReview } = useCatalog();
  const [name, setName] = useState('');
  const [area, setArea] = useState('المكلا');
  const [targetName, setTargetName] = useState(defaultTarget || 'معرض الطويل للأثاث');
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error('يرجى كتابة اسمك وتجربتك للتقييم');
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        name: name.trim(),
        area: area.trim() || 'المكلا',
        rating,
        text: text.trim(),
        service: targetName || 'شراء أثاث وتوصيل',
        approved: true,
      });
      toast.success('تم تسجيل تقييمك بنجاح', {
        description: 'شكرًا لمشاركتك رأيك، سينعكس تقييمك مباشرة في قسم آراء العملاء.',
      });
      setName('');
      setText('');
      setRating(5);
      onOpenChange(false);
    } catch {
      toast.error('تعذر إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] rounded-2xl border border-[#E5DEC9] bg-[#FAF7F2] p-6 sm:max-w-lg text-right shadow-2xl"
        dir="rtl"
      >
        <DialogHeader className="text-right pb-3 border-b border-[#E5DEC9]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE7DA] border border-[#E2D5C3] text-[#9C6644]">
              <Star className="h-5 w-5 fill-[#9C6644] text-[#9C6644]" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-[#231F1E]">
                تقييم جودة الخدمة والمنتج
              </DialogTitle>
              <DialogDescription className="text-xs text-[#786C65] mt-0.5">
                تقييم موثق لمشترياتك يعزز جودة الخدمة ويُنشر في منصة إيوان
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* اختيار المعرض أو المصمم */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">الجهة المعتمدة</Label>
            <select
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E5DEC9] bg-[#F3EDE2]/60 px-3 text-xs text-[#231F1E] outline-none focus:border-[#9C6644]"
            >
              <optgroup label="المعارض المعتمدة">
                {stores.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المصممون والورش">
                {designers.map((d) => (
                  <option key={d.id} value={`المصممة ${d.name}`}>
                    المصممة {d.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* تحديد النجوم الهندسية الرسمية بدون إيموجي */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">درجة التقييم</Label>
            <div className="flex items-center justify-center gap-2.5 py-2.5 bg-[#F3EDE2]/40 rounded-xl border border-[#E5DEC9]/60">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} من 5 نجوم`}
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      star <= rating
                        ? 'fill-[#9C6644] text-[#9C6644]'
                        : 'text-[#D5CBB8]',
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-medium text-[#9C6644]">
              {rating === 5 && 'تقييم ممتاز — جودة عالية ومطابقة تامة للمواصفات'}
              {rating === 4 && 'تقييم جيد جداً — تجربة مرضية وملتزمة بالمواعيد'}
              {rating === 3 && 'تقييم جيد — جودة مقبولة'}
              {rating <= 2 && 'أقل من المتوقع'}
            </p>
          </div>

          {/* الاسم والمنطقة */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#231F1E]">الاسم</Label>
              <Input
                placeholder="اسم العميل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#231F1E]">المدينة / الحي</Label>
              <Input
                placeholder="مثال: المكلا"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-10 text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60"
              />
            </div>
          </div>

          {/* نص التقييم */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">ملاحظات التجربة ومستوى الجودة</Label>
            <Textarea
              placeholder="اكتب ملاحظاتك عن جودة الخشب والتشطيب، دقة التسليم، والتعامل…"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60 placeholder:text-[#9C8E84]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start pt-2 border-t border-[#E5DEC9]/80">
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="h-10 rounded-full bg-[#231F1E] px-6 text-xs font-semibold text-[#FAF7F2] hover:bg-[#9C6644] transition-colors"
          >
            {submitting ? 'جارٍ الحفظ…' : 'اعتماد وحفظ التقييم'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-full border-[#E5DEC9] bg-[#F3EDE2]/50 text-xs text-[#5C534E] hover:bg-[#F3EDE2]"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
