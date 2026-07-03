export type Role = "citizen" | "government_officer" | "village_admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  village_id: string | null;
  department_id: string | null;
  preferred_language: string;
}

export type ComplaintCategory =
  | "road"
  | "garbage"
  | "water"
  | "electricity"
  | "street_light"
  | "drainage"
  | "public_safety"
  | "other";

export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface StatusHistoryItem {
  id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  changed_at: string;
  changed_by_name: string | null;
}

export interface Complaint {
  id: string;
  citizen_id: string;
  citizen_name: string | null;
  village_id: string;
  department_id: string | null;
  department_name: string | null;
  category: ComplaintCategory;
  description_text: string;
  status: ComplaintStatus;
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  status_history: StatusHistoryItem[];
}

export interface Announcement {
  id: string;
  village_id: string;
  posted_by: string;
  posted_by_name: string | null;
  title: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  category: string;
  title: string;
  body: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsOverview {
  total_complaints: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  avg_resolution_hours: number | null;
  resolved_count: number;
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road: "Road Damage",
  garbage: "Garbage",
  water: "Water Supply",
  electricity: "Electricity",
  street_light: "Street Light",
  drainage: "Drainage",
  public_safety: "Public Safety",
  other: "Other",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};
