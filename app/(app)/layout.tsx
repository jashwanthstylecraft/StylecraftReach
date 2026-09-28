import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { getPendingSubmissionsCount } from "@/lib/portal-data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const pendingApprovalsCount = await getPendingSubmissionsCount().catch(() => 0);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar pendingApprovalsCount={pendingApprovalsCount} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
