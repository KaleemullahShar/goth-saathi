"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Complaint, ComplaintStatus, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
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

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");

  useEffect(() => {
    api.get<Complaint[]>("/api/complaints").then(setComplaints);
  }, []);

  const filtered =
    complaints?.filter((c) => statusFilter === "all" || c.status === statusFilter) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
          All Complaints
        </h1>
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
        <EmptyState title="No complaints found" description="Try a different status filter." />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link key={c.id} href={`/admin/complaints/${c.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                      {CATEGORY_LABELS[c.category]}
                      {c.department_name ? ` · ${c.department_name}` : " · Unassigned"}
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
