"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Complaint, CATEGORY_LABELS } from "@/lib/types";
import { Card, Skeleton, EmptyState } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

export default function CitizenComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    api.get<Complaint[]>("/api/complaints").then(setComplaints);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
          My Complaints
        </h1>
        <Link href="/citizen/complaints/new">
          <Button>Report an Issue</Button>
        </Link>
      </div>

      {complaints === null ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints yet"
          description="Report a civic issue and track its status here — from submission to resolution."
          action={
            <Link href="/citizen/complaints/new">
              <Button>Report an issue</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Link key={c.id} href={`/citizen/complaints/${c.id}`}>
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
                      Submitted {new Date(c.created_at).toLocaleDateString()}
                      {c.department_name ? ` · ${c.department_name}` : ""}
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
