"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Announcement } from "@/lib/types";
import { Card, Skeleton, EmptyState } from "@/components/ui";

export default function CitizenAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  useEffect(() => {
    api.get<Announcement[]>("/api/announcements").then(setAnnouncements);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
        Village Announcements
      </h1>

      {announcements === null ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Notices from your Village Administrator will show up here."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                {a.title}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-text-secondary">{a.body}</p>
              <p className="mt-3 text-xs text-text-secondary">
                Posted by {a.posted_by_name} · {new Date(a.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
