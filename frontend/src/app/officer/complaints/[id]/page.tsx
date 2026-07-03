"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, API_BASE, ApiError } from "@/lib/api";
import { Complaint, ComplaintStatus, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import { Card, Skeleton, Textarea, Label, ErrorBanner } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import ComplaintTimeline from "@/components/ComplaintTimeline";
import Button from "@/components/Button";

const VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  submitted: ["under_review", "rejected"],
  under_review: ["in_progress", "rejected"],
  in_progress: ["resolved", "under_review"],
  resolved: ["in_progress"],
  rejected: ["under_review"],
};

export default function OfficerComplaintDetail() {
  const params = useParams();
  const id = params.id as string;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const c = await api.get<Complaint>(`/api/complaints/${id}`);
    setComplaint(c);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(newStatus: ComplaintStatus) {
    setError(null);
    setUpdating(newStatus);
    try {
      await api.patch(`/api/complaints/${id}/status`, {
        new_status: newStatus,
        note: note || undefined,
      });
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status.");
    } finally {
      setUpdating(null);
    }
  }

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const nextOptions = VALID_TRANSITIONS[complaint.status];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-text-secondary">Complaint #{complaint.id.slice(0, 8)}</p>
          <h1 className="mt-1 text-xl font-semibold text-text-primary dark:text-text-primaryDark">
            {CATEGORY_LABELS[complaint.category]}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Reported by {complaint.citizen_name}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <Card>
        <p className="text-sm text-text-primary dark:text-text-primaryDark">
          {complaint.description_text}
        </p>
        {complaint.location_label && (
          <p className="mt-3 text-sm text-text-secondary">📍 {complaint.location_label}</p>
        )}
        {complaint.photo_url && (
          <img
            src={`${API_BASE}${complaint.photo_url}`}
            alt="Complaint evidence"
            className="mt-4 max-h-72 w-full rounded-card object-cover"
          />
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-text-primary dark:text-text-primaryDark">
          Update Status
        </h2>
        {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
        <Label>Note (optional, visible to the citizen)</Label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Assigned to a lineman, expected inspection Thursday."
          className="mb-4"
        />
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((s) => (
            <Button
              key={s}
              variant={s === "rejected" ? "destructive" : "primary"}
              loading={updating === s}
              onClick={() => updateStatus(s)}
            >
              Mark as {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-text-primary dark:text-text-primaryDark">
          Status Timeline
        </h2>
        <Card>
          <ComplaintTimeline history={complaint.status_history} />
        </Card>
      </div>
    </div>
  );
}
