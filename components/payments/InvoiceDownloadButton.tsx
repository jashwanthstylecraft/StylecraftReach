import { FileText } from "lucide-react";

export function InvoiceDownloadButton({
  pdfUrl,
  invoiceNumber,
}: {
  pdfUrl: string | null;
  invoiceNumber?: string;
}) {
  if (!pdfUrl) {
    return <span className="text-xs text-text-muted">—</span>;
  }

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 text-xs text-gold hover:underline"
    >
      <FileText className="h-3.5 w-3.5" />
      {invoiceNumber ?? "Download"}
    </a>
  );
}
