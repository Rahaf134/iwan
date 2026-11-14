import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذّر قراءة الملف'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('صيغة الصورة غير مدعومة'));
      image.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(String(reader.result));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const ImageUploadField = ({
  value,
  onChange,
  label = 'الصورة',
  hint = 'ارفع صورة من جهازك — تُحفظ داخل البيانات مباشرة',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذّر رفع الصورة');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          onClick={() => setShowUrl((current) => !current)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-wood"
        >
          <Link2 className="h-3 w-3" strokeWidth={1.6} />
          {showUrl ? 'إخفاء رابط خارجي' : 'استخدام رابط خارجي'}
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <img src={value} alt="معاينة الصورة" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-5 w-5" strokeWidth={1.4} />
            </div>
          )}
          {value && (
            <button
              type="button"
              aria-label="إزالة الصورة"
              onClick={() => onChange('')}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="h-9 rounded-full border-border px-4 text-xs hover:border-wood/60"
          >
            {busy ? (
              <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
            ) : (
              <ImagePlus className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.6} />
            )}
            رفع صورة من الجهاز
          </Button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
          {showUrl && (
            <Input
              value={value.startsWith('data:') ? '' : value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://…"
              className="h-9 rounded-xl text-xs"
              dir="ltr"
            />
          )}
          {error && <p className="text-[11px] text-wood">{error}</p>}
        </div>
      </div>
    </div>
  );
};
