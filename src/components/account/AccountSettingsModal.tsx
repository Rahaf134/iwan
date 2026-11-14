import { useState } from 'react';
import { User, Save } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountSettingsModal = ({ open, onOpenChange }: AccountSettingsModalProps) => {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || localStorage.getItem('ewan_saved_phone') || '');
  const [address, setAddress] = useState(profile?.address || localStorage.getItem('ewan_saved_address') || 'المكلا — حضرموت');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('ewan_saved_phone', phone.trim());
      localStorage.setItem('ewan_saved_address', address.trim());
      localStorage.setItem('ewan_saved_name', fullName.trim());
      toast.success('تم حفظ إعدادات الحساب بنجاح');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-[#E5DEC9] bg-[#FAF7F2] sm:max-w-md text-right" dir="rtl">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9C6644]/10 text-[#9C6644] border border-[#9C6644]/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-[#231F1E]">إعدادات الحساب وبيانات التوصيل</DialogTitle>
              <DialogDescription className="text-xs text-[#786C65] mt-0.5">
                تُستخدم هذه البيانات لتسهيل تأكيد طلبات الأثاث والتوصيل داخل المكلا.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">الاسم الكامل</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسمك الكريم"
              className="h-10 text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">رقم الجوال والتواصل</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="7xxxxxxxx"
              dir="ltr"
              className="h-10 text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#231F1E]">العنوان والحي في المكلا</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: فوه، حي المساكن، بالقرب من جامع النور"
              className="h-10 text-xs rounded-xl border-[#E5DEC9] bg-[#F3EDE2]/60"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-full bg-[#231F1E] px-5 text-xs font-semibold text-white hover:bg-[#9C6644] transition-colors"
          >
            <Save className="ml-1.5 h-3.5 w-3.5" />
            حفظ التعديلات
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-full border-[#E5DEC9] text-xs text-[#5C534E]"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
