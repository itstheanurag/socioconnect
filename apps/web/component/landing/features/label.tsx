import { cn } from "@/lib/utils";

type FeatureLabelProps = {
  icon: React.ReactNode;
  text: string;
  className?: string;
};

export default function FeatureLabel({ icon, text, className }: FeatureLabelProps) {
  return (
    <div
      className={cn(
        "mb-4 inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300",
        className,
      )}
    >
      {icon}
      {text}
    </div>
  );
}
