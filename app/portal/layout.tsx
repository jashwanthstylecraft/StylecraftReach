import { PortalNav } from "@/components/portal/PortalNav";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { ToastProvider } from "@/components/ui/Toast";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-portal-bg text-portal-text-primary">
        <PortalNav />
        <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:pb-6">{children}</main>
        <PortalMobileNav />
      </div>
    </ToastProvider>
  );
}
