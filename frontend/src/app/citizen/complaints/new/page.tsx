"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Complaint, ComplaintCategory, CATEGORY_LABELS } from "@/lib/types";
import { Card, Label, Textarea, Select, Input, ErrorBanner } from "@/components/ui";
import Button from "@/components/Button";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ComplaintCategory[];

export default function NewComplaintPage() {
  const router = useRouter();
  const [category, setCategory] = useState<ComplaintCategory>("road");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (description.trim().length < 8) {
      setError("Please describe the issue in a bit more detail.");
      return;
    }
    setLoading(true);
    try {
      const complaint = await api.post<Complaint>("/api/complaints", {
        category,
        description_text: description,
        location_label: locationLabel || undefined,
        location_lat: lat ? parseFloat(lat) : undefined,
        location_lng: lng ? parseFloat(lng) : undefined,
      });

      if (photo) {
        const form = new FormData();
        form.append("file", photo);
        await api.postForm(`/api/complaints/${complaint.id}/photo`, form);
      }

      router.push(`/citizen/complaints/${complaint.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit complaint.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
          Report an Issue
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tell us what&apos;s wrong — we&apos;ll route it to the right department automatically.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <ErrorBanner message={error} />}

          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as ComplaintCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>What&apos;s happening?</Label>
            <Textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The street light outside the mosque has been off for over a week."
            />
          </div>

          <div>
            <Label>Location (optional)</Label>
            <Input
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g. Near Jamia Masjid, Main Road"
              className="mb-2"
            />
            <div className="flex items-center gap-2">
              <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
              <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
              <Button type="button" variant="secondary" onClick={useMyLocation} loading={locating}>
                Use my location
              </Button>
            </div>
          </div>

          <div>
            <Label>Photo (optional)</Label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-card file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary dark:file:text-primary-dark"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" loading={loading}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
