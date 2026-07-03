"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AnalyticsOverview, Complaint, ComplaintStatus, CATEGORY_LABELS } from "@/lib/types";
import { Card, Skeleton, EmptyState } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recent, setRecent] = useState<Complaint[] | null>(null);

  useEffect(() => {
    api.get<AnalyticsOverview>("/api/analytics/overview").then(setAnalytics);
    api.get<Complaint[]>("/api/complaints").then((c) => setRecent(c.slice(0, 6)));
  }, []);

  const maxCategory = analytics
    ? Math.max(1, ...Object.values(analytics.by_category))
    : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primaryDark">
          Village Overview
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Operational summary across all departments in your village.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total Complaints" value={analytics?.total_complaints} />
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
          label="Avg. Resolution"
          value={analytics?.avg_resolution_hours != null ? `${analytics.avg_resolution_hours}h` : "—"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-text-primary dark:text-text-primaryDark">
            Most Reported Issues
          </h2>
          <p className="mb-4 text-xs text-text-secondary">
            {analytics && Object.keys(analytics.by_category).length > 0
              ? `${Object.entries(analytics.by_category).sort((a, b) => b[1] - a[1])[0][0].replace("_", " ")} is the top category this period.`
              : "No complaints reported yet."}
          </p>
          {analytics === null ? (
            <Skeleton className="h-40 w-full" />
          ) : Object.keys(analytics.by_category).length === 0 ? (
            <EmptyState title="No data yet" description="Category breakdown will appear once complaints come in." />
          ) : (
            <div className="space-y-2">
              {Object.entries(analytics.by_category)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-text-secondary capitalize">
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                    </span>
                    <div className="h-2.5 flex-1 rounded-full bg-black/5 dark:bg-white/5">
                      <div
                        className="h-2.5 rounded-full bg-primary dark:bg-primary-dark"
                        style={{ width: `${(count / maxCategory) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-text-secondary">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-text-primary dark:text-text-primaryDark">
            Status Breakdown
          </h2>
          <p className="mb-4 text-xs text-text-secondary">
            Where complaints stand right now, village-wide.
          </p>
          {analytics === null ? (
            <Skeleton className="h-40 w-full" />
          ) : Object.keys(analytics.by_status).length === 0 ? (
            <EmptyState title="No data yet" description="Status breakdown will appear once complaints come in." />
          ) : (
            <div className="space-y-2">
              {Object.entries(analytics.by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status as ComplaintStatus} />
                  <span className="text-sm text-text-secondary">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
            Recent Complaints
          </h2>
          <Link href="/admin/complaints" className="text-sm font-medium text-primary dark:text-primary-dark">
            View all
          </Link>
        </div>
        {recent === null ? (
          <Skeleton className="h-40 w-full" />
        ) : recent.length === 0 ? (
          <EmptyState title="No complaints yet" description="New citizen reports will appear here." />
        ) : (
          <div className="space-y-2">
            {recent.map((c) => (
              <Link key={c.id} href={`/admin/complaints/${c.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                        {CATEGORY_LABELS[c.category]}
                        {c.department_name ? ` · ${c.department_name}` : ""}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                        {c.description_text}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
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
