import { cn } from "@/lib/utils";

const STAR_PATH = "M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z";

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="block shrink-0">
      <path d={STAR_PATH} fill={color} />
    </svg>
  );
}

/** Five stars filled to the nearest half point. */
export function Stars({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = rounded >= i + 1 ? 100 : rounded >= i + 0.5 ? 50 : 0;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} color="#f6dfe8" />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <StarIcon size={size} color="#ffb700" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
