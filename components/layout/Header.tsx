import { UserButton } from "@clerk/nextjs";

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
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
