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
import { Textarea } from '@/components/ui/textarea';
import { useCatalog } from '@/contexts/CatalogContext';
import type { FaqRecord } from '@/lib/catalogApi';

export const FaqManager = () => {
  const { faqs, createFaq, updateFaq, removeFaq } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqRecord | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setQuestion('');
    setAnswer('');
    setOpen(true);
  };

  const openEdit = (faq: FaqRecord) => {
    setEditing(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOpen(true);
  };

  const submit = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('السؤال والجواب مطلوبان');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateFaq(editing.dbId, { question: question.trim(), answer: answer.trim() });
      else await createFaq({ question: question.trim(), answer: answer.trim() });
      toast.success(editing ? 'تم تحديث السؤال' : 'تمت إضافة السؤال');
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSection
      title="إدارة الأسئلة الشائعة"
      description={`${faqs.length} سؤال في صفحة الأسئلة الشائعة.`}
      action={
        <Button onClick={openCreate} className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          <Plus className="ml-2 h-4 w-4" strokeWidth={1.8} />
          سؤال جديد
        </Button>
      }
    >
      {faqs.length === 0 ? (
        <AdminEmpty message="لا توجد أسئلة بعد." />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.dbId} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-balance">{faq.question}</p>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label="تعديل" onClick={() => openEdit(faq)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" strokeWidth={1.6} />
                  </Button>
                  <DeleteButton onConfirm={() => void removeFaq(faq.dbId)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? 'تعديل السؤال' : 'سؤال جديد'}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              يظهر السؤال في صفحة الأسئلة الشائعة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <AdminField label="السؤال" htmlFor="f-q">
              <Input id="f-q" value={question} onChange={(event) => setQuestion(event.target.value)} className="h-11 rounded-xl border-border px-3 text-base" />
            </AdminField>
            <AdminField label="الجواب" htmlFor="f-a">
              <Textarea id="f-a" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} className="rounded-xl border-border px-3 text-base" />
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
