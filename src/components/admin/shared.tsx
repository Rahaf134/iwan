import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const AdminSection = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section>
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-xl text-balance md:text-2xl">{title}</h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

export const AdminField = ({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
  </div>
);

export const DeleteButton = ({
  onConfirm,
  label = 'حذف',
}: {
  onConfirm: () => void;
  label?: string;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-border bg-background md:max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-display text-lg">تأكيد الحذف</AlertDialogTitle>
        <AlertDialogDescription className="text-pretty text-sm text-muted-foreground">
          سيتم حذف هذا العنصر نهائياً من قاعدة البيانات. لا يمكن التراجع.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel className="h-10 rounded-full border-border">إلغاء</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          حذف نهائي
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const AdminEmpty = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
    {message}
  </div>
);
