import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const LOGO_URL =
  'https://miaoda-conversation-file.s3cdn.medo.dev/user-fisv0pmzijuo/app-fmfrrsb99ji9/20261112/logo.png';

export const Logo = ({
  className,
  showTagline = true,
  to = '/',
}: {
  className?: string;
  showTagline?: boolean;
  to?: string;
}) => (
  <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label="إيوان — الصفحة الرئيسية">
    <img
      src={LOGO_URL}
      alt="شعار إيوان لتصميم الأثاث والمساحات"
      className="h-11 w-auto shrink-0 object-contain mix-blend-multiply md:h-12"
    />
    {showTagline && (
      <span className="hidden flex-col leading-none @[62rem]:flex">
        <span className="text-[10px] tracking-wide text-muted-foreground">
          لتصميم الأثاث والمساحات
        </span>
      </span>
    )}
  </Link>
);
