import { CheckCircle2, DollarSign, Package, ListPlus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export interface ActivityItem {
  type: "submitted" | "payment" | "shipped" | "deliverable_added";
  date: string;
  text: string;
}

const ICONS = {
  submitted: CheckCircle2,
  payment: DollarSign,
  shipped: Package,
  deliverable_added: ListPlus,
};

const COLORS = {
  submitted: "text-portal-success",
  payment: "text-gold",
  shipped: "text-portal-text-secondary",
  deliverable_added: "text-portal-text-secondary",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-portal-text-secondary">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const Icon = ICONS[item.type];
        return (
          <div key={i} className="flex items-start gap-3 text-sm">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${COLORS[item.type]}`} />
            <div className="flex-1">
              <p className="text-portal-text-primary">{item.text}</p>
              <p className="text-xs text-portal-text-secondary">{formatDateTime(item.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
