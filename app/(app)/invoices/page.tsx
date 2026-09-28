import { Header } from "@/components/layout/Header";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { getInvoices } from "@/lib/payments-data";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div>
      <Header title="Invoices" subtitle={`${invoices.length} invoices issued`} />
      <div className="p-8">
        <InvoicesTable invoices={invoices} />
      </div>
    </div>
  );
}
