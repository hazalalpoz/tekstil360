"use client";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
};

export function Stars({ value, onChange, size = "md" }: Props) {
  const sz = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className={`inline-flex gap-0.5 ${sz}`} role="group" aria-label="Puan">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </span>
  );
}
