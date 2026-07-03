"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, API_BASE } from "@/lib/api";
import { Complaint, CATEGORY_LABELS } from "@/lib/types";
import { Card, Skeleton } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import ComplaintTimeline from "@/components/ComplaintTimeline";

export default function CitizenComplaintDetail() {
  const params = useParams();
  const id = params.id as string;
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    api.get<Complaint>(`/api/complaints/${id}`).then(setComplaint);
  }, [id]);

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-text-secondary">Complaint #{complaint.id.slice(0, 8)}</p>
          <h1 className="mt-1 text-xl font-semibold text-text-primary dark:text-text-primaryDark">
            {CATEGORY_LABELS[complaint.category]}
          </h1>
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
        {complaint.department_name && (
          <p className="mt-1 text-sm text-text-secondary">
            Routed to: <span className="font-medium">{complaint.department_name}</span>
          </p>
        )}
        {complaint.photo_url && (
          <img
            src={`${API_BASE}${complaint.photo_url}`}
            alt="Complaint evidence"
            className="mt-4 max-h-72 w-full rounded-card object-cover"
          />
        )}
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
