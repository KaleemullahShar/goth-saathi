"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Complaint, Announcement, CATEGORY_LABELS } from "@/lib/types";
import { Card, Skeleton, EmptyState } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  useEffect(() => {
    api.get<Complaint[]>("/api/complaints").then(setComplaints);
    api.get<Announcement[]>("/api/announcements").then(setAnnouncements);
  }, []);

  const openCount = complaints?.filter((c) => c.status !== "resolved" && c.status !== "rejected").length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primaryDark">
          Assalam-o-Alaikum, {user?.full_name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {openCount > 0
            ? `You have ${openCount} open complaint${openCount > 1 ? "s" : ""} being tracked.`
            : "You have no open complaints right now."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/citizen/complaints/new" label="Report an Issue" icon="📍" />
        <QuickAction href="/citizen/complaints" label="Check My Complaints" icon="📋" />
        <QuickAction href="/citizen/announcements" label="Village Announcements" icon="📣" />
        <QuickAction href="/citizen/complaints" label="Emergency Contacts" icon="🚨" sublabel="(Phase 5)" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
              Recent Activity
            </h2>
            <Link href="/citizen/complaints" className="text-sm font-medium text-primary dark:text-primary-dark">
              View all
            </Link>
          </div>
          {complaints === null ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No complaints yet"
              description="Report a civic issue like a broken street light or garbage pileup and track it here."
              action={
                <Link href="/citizen/complaints/new">
                  <Button>Report an issue</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {complaints.slice(0, 4).map((c) => (
                <Link key={c.id} href={`/citizen/complaints/${c.id}`}>
                  <Card className="transition-colors hover:border-primary/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                          {CATEGORY_LABELS[c.category]}
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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
              Community Updates
            </h2>
            <Link href="/citizen/announcements" className="text-sm font-medium text-primary dark:text-primary-dark">
              View all
            </Link>
          </div>
          {announcements === null ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState
              title="No announcements yet"
              description="Village-wide notices from your Union Council will appear here."
            />
          ) : (
            <div className="space-y-2">
              {announcements.slice(0, 4).map((a) => (
                <Card key={a.id}>
                  <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                    {a.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{a.body}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    Posted by {a.posted_by_name} ·{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
  sublabel,
}: {
  href: string;
  label: string;
  icon: string;
  sublabel?: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex h-full flex-col items-start gap-2 transition-colors hover:border-primary/40">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
          {label}
        </span>
        {sublabel && <span className="text-xs text-text-secondary">{sublabel}</span>}
      </Card>
    </Link>
  );
}
