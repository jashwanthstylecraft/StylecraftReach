import { UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-5">
      <div>
        <h1 className="font-sans text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {isClerkConfigured ? (
        <UserButton afterSignOutUrl="/sign-in" />
      ) : (
        <span className="rounded border border-warning/30 bg-warning/10 px-2 py-1 font-mono text-[11px] text-warning">
          Auth not configured
        </span>
      )}
    </header>
  );
}
