"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Announcement } from "@/lib/types";
import { Card, Skeleton, EmptyState, Input, Textarea, Label, ErrorBanner } from "@/components/ui";
import Button from "@/components/Button";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await api.get<Announcement[]>("/api/announcements");
    setAnnouncements(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/announcements", { title, body });
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post announcement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
          Announcements
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Post a notice — every citizen in your village will be notified.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <Label>Title</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Post Announcement
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-primary dark:text-text-primaryDark">
          Posted Announcements
        </h2>
        {announcements === null ? (
          <Skeleton className="h-24 w-full" />
        ) : announcements.length === 0 ? (
          <EmptyState title="No announcements yet" description="Announcements you post will appear here." />
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
    </div>
  );
}
