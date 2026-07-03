"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Complaint,
  ComplaintStatus,
  AnalyticsOverview,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/types";
import { Card, Skeleton, EmptyState, Select } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

const STATUS_FILTERS: (ComplaintStatus | "all")[] = [
  "all",
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "rejected",
];

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");

  useEffect(() => {
    api.get<Complaint[]>("/api/complaints").then(setComplaints);
    api.get<AnalyticsOverview>("/api/analytics/overview").then(setAnalytics);
  }, []);

  const filtered =
    complaints?.filter((c) => statusFilter === "all" || c.status === statusFilter) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primaryDark">
          Complaint Queue
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Complaints routed to your department only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total" value={analytics?.total_complaints} />
        <StatTile
          label="Open"
          value={
            analytics
              ? analytics.total_complaints - (analytics.by_status.resolved ?? 0) - (analytics.by_status.rejected ?? 0)
              : undefined
          }
        />
        <StatTile label="Resolved" value={analytics?.resolved_count} />
        <StatTile
          label="Avg. resolution"
          value={analytics?.avg_resolution_hours != null ? `${analytics.avg_resolution_hours}h` : undefined}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
          Queue
        </h2>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "all")}
          className="w-48"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {complaints === null ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${user?.department_id ? "" : ""}complaints ${statusFilter === "all" ? "" : `with status "${STATUS_LABELS[statusFilter as ComplaintStatus]}"`}`}
          description="New complaints routed to your department will appear here automatically."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link key={c.id} href={`/officer/complaints/${c.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                      {CATEGORY_LABELS[c.category]}
                      {c.location_label ? ` · ${c.location_label}` : ""}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                      {c.description_text}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Reported by {c.citizen_name} ·{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary dark:text-text-primaryDark">
        {value ?? <span className="inline-block h-6 w-10 animate-pulse rounded bg-black/5 dark:bg-white/5" />}
      </p>
    </Card>
  );
}
