import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StarRating = ({
  rating,
  reviews,
  className,
}: {
  rating: number;
  reviews?: number;
  className?: string;
}) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
      <span className="text-xs text-muted-foreground">
        {safeRating.toFixed(1)}
        {typeof reviews === 'number' && <span className="mr-1">({reviews})</span>}
      </span>
    </div>
  );
};
