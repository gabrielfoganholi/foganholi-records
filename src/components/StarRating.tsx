"use client";

interface Props {
  value: number | null;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

export default function StarRating({ value, onChange, size = "md" }: Props) {
  const interactive = !!onChange;
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange?.(value === n ? 0 : n);
            }}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            aria-label={`${n} de 5 estrelas`}
          >
            <svg
              viewBox="0 0 20 20"
              className={`${dim} ${filled ? "fill-amber-400" : "fill-walnut-700"}`}
            >
              <path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9L1.5 7.6l5.9-.7L10 1.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
