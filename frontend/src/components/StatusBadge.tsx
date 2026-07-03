import { ComplaintStatus, STATUS_LABELS } from "@/lib/types";

const STYLES: Record<ComplaintStatus, string> = {
  submitted: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  under_review: "bg-info/10 text-info dark:bg-info/20 dark:text-info-dark",
  in_progress: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-dark",
  resolved: "bg-success/10 text-success dark:bg-success/20 dark:text-success-dark",
  rejected: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-dark",
};

export default function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
