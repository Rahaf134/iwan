import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { useCatalog } from '@/contexts/CatalogContext';

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'order' | 'custom';
  subject: string;
  title: string;
  description: string;
  detailsLabel: string;
  detailsPlaceholder: string;
}

export const RequestDialog = ({
  open,
  onOpenChange,
  type,
  subject,
  title,
  description,
  detailsLabel,
  detailsPlaceholder,
}: RequestDialogProps) => {
  const { createRequest } = useCatalog();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setPhone('');
      setDetails('');
    }
  }, [open]);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('الاسم ورقم التواصل مطلوبان');
      return;
    }
    setSaving(true);
    try {
      await createRequest({
        type,
        name: name.trim(),
        phone: phone.trim(),
        details: `${subject} — ${details.trim()}`,
      });
      toast.success('تم إرسال طلبك بنجاح', {
        description: 'سيتواصل معك الفريق خلال ٤٨ ساعة عمل.',
      });
      onOpenChange(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر إرسال الطلب');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background sm:rounded-3xl md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-balance">{title}</DialogTitle>
          <DialogDescription className="text-pretty text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="request-name">الاسم الكامل</Label>
            <Input
              id="request-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: أحمد بامطرف"
              className="h-11 rounded-xl border-border px-3 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-phone">رقم التواصل</Label>
            <Input
              id="request-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="7xxxxxxxx"
              dir="ltr"
              className="h-11 rounded-xl border-border px-3 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-details">{detailsLabel}</Label>
            <Textarea
              id="request-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={detailsPlaceholder}
              rows={4}
              className="rounded-xl border-border px-3 text-base"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full border-border px-5"
          >
            إلغاء
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={saving}
            className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {saving ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
