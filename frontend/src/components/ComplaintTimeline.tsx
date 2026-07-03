import { StatusHistoryItem, STATUS_LABELS } from "@/lib/types";

export default function ComplaintTimeline({ history }: { history: StatusHistoryItem[] }) {
  if (history.length === 0) return null;
  return (
    <ol className="space-y-0">
      {history.map((h, idx) => (
        <li key={h.id} className="relative pb-6 pl-8 last:pb-0">
          {idx !== history.length - 1 && (
            <span className="absolute left-[9px] top-5 h-full w-px bg-border dark:bg-border-dark" />
          )}
          <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-primary-dark">
            <span className="h-2 w-2 rounded-full bg-primary dark:bg-primary-dark" />
          </span>
          <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
            {STATUS_LABELS[h.new_status as keyof typeof STATUS_LABELS] ?? h.new_status}
          </p>
          {h.note && <p className="mt-0.5 text-sm text-text-secondary">{h.note}</p>}
          <p className="mt-1 text-xs text-text-secondary">
            {new Date(h.changed_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}
