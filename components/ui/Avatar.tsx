import { initials, cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-surface-elevated font-mono font-medium text-text-secondary",
        sizeClass,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
