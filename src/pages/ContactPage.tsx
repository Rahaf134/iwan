import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCatalog } from '@/contexts/CatalogContext';

const ContactPage = () => {
  const { createRequest } = useCatalog();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('أكمل جميع الحقول');
      return;
    }
    setSaving(true);
    try {
      await createRequest({
        type: 'custom',
        name: name.trim(),
        phone: phone.trim(),
        details: `رسالة تواصل — ${message.trim()}`,
      });
      toast.success('تم إرسال رسالتك', { description: 'سنعود إليك خلال ٤٨ ساعة عمل.' });
      setName('');
      setPhone('');
      setMessage('');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر إرسال الرسالة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="تواصل معنا — إيوان المكلا" description="تواصل مع فريق إيوان في المكلا، حضرموت." />
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="border-b border-border py-10 md:py-14">
          <p className="eyebrow">تواصل معنا</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-balance md:text-5xl">
            نحن في المكلا، قريبون منك
          </h1>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-14">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-medium">العنوان</p>
                <p className="mt-1 text-sm text-muted-foreground">المكلا — حضرموت، اليمن</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-medium">الهاتف</p>
                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">+967 5 000 100</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-medium">البريد</p>
                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">hello@ewan.ye</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-medium">أوقات العمل</p>
                <p className="mt-1 text-sm text-muted-foreground">السبت — الخميس · ٩ صباحاً — ٩ مساءً</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-display text-xl">أرسل رسالة</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">الاسم</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 rounded-xl border-border px-3 text-base"
                  placeholder="اسمك الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">رقم التواصل</Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  dir="ltr"
                  className="h-11 rounded-xl border-border px-3 text-base"
                  placeholder="7xxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">رسالتك</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  className="rounded-xl border-border px-3 text-base"
                  placeholder="كيف يمكننا مساعدتك؟"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
