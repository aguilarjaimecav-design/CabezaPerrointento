import { Star } from 'lucide-react';

interface StarRatingProps {
  valoracion: number;
  numValoraciones?: number;
  size?: number;
}

export function StarRating({ valoracion, numValoraciones, size = 15 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= Math.round(valoracion);
          return (
            <Star
              key={n}
              size={size}
              className={filled ? 'fill-accent-500 text-accent-500' : 'fill-neutral-200 text-neutral-200'}
            />
          );
        })}
      </div>
      <span className="text-xs text-secondary-600">
        {valoracion.toFixed(1)}
        {typeof numValoraciones === 'number' && ` (${numValoraciones})`}
      </span>
    </div>
  );
}
