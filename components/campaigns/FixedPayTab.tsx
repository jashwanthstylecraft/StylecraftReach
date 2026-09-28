import { OutstandingTable } from "@/components/payments/OutstandingTable";
import type { OutstandingRow } from "@/lib/payments-data";

export function FixedPayTab({ rows, onboardedIds }: { rows: OutstandingRow[]; onboardedIds: Set<string> }) {
  return <OutstandingTable rows={rows} onboardedIds={onboardedIds} />;
}
