import { cn } from "@/lib/utils";

type FeatureCardHeaderProps = {
  number: number;
  category: string;
  label: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export default function FeatureCardHeader({
  number,
  category,
  label,
  title,
  description,
  className,
}: FeatureCardHeaderProps) {
  return (
    <header className={cn("relative z-10", className)}>
      {/* Header Meta */}
      <div className="mb-5 flex min-h-7 items-center justify-between gap-4">
        {/* Feature Label */}
        <div className="min-w-0">{label}</div>

        {/* Feature Number */}
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          {String(number).padStart(2, "0")} / {category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
