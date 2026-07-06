"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { SINDH_DISTRICTS, SINDH_DISTRICTS_TEHSILS } from "@/lib/sindh-locations";
import Button from "@/components/Button";
import { Input, Label, ErrorBanner, Select } from "@/components/ui";

interface Village {
  id: string;
  name: string;
  union_council: string | null;
  district: string | null;
  tehsil: string | null;
}
interface Department {
  id: string;
  name: string;
}

const ADD_NEW_VALUE = "__add_new__";

export default function RegisterPage() {
  const { register } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [departmentId, setDepartmentId] = useState("");

  // Cascading location selection: District -> Tehsil -> Village
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [villages, setVillages] = useState<Village[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [villageId, setVillageId] = useState("");
  const [newVillageName, setNewVillageName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAddingNewVillage = villageId === ADD_NEW_VALUE;

  // When district changes, reset tehsil/village selections downstream of it.
  function handleDistrictChange(value: string) {
    setDistrict(value);
    setTehsil("");
    setVillages([]);
    setVillageId("");
    setNewVillageName("");
  }

  // When tehsil changes, fetch villages already registered in that tehsil.
  function handleTehsilChange(value: string) {
    setTehsil(value);
    setVillageId("");
    setNewVillageName("");
  }

  useEffect(() => {
    if (!district || !tehsil) {
      setVillages([]);
      return;
    }
    setVillagesLoading(true);
    api
      .get<Village[]>(
        `/api/villages?district=${encodeURIComponent(district)}&tehsil=${encodeURIComponent(tehsil)}`
      )
      .then((v) => {
        setVillages(v);
        setVillagesLoading(false);
      })
      .catch(() => setVillagesLoading(false));
  }, [district, tehsil]);

  useEffect(() => {
    if (!villageId || isAddingNewVillage) {
      setDepartments([]);
      return;
    }
    api
      .get<Department[]>(`/api/departments?village_id=${villageId}`)
      .then((d) => {
        setDepartments(d);
        if (d.length > 0) setDepartmentId(d[0].id);
      });
  }, [villageId, isAddingNewVillage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!district || !tehsil) {
      setError("Please select your district and tehsil.");
      return;
    }
    if (!villageId) {
      setError("Please select your village, or add it if it isn't listed.");
      return;
    }
    if (isAddingNewVillage && newVillageName.trim().length < 2) {
      setError("Please enter your village's name.");
      return;
    }

    setLoading(true);
    try {
      let finalVillageId = villageId;

      if (isAddingNewVillage) {
        const created = await api.post<Village>("/api/villages", {
          name: newVillageName.trim(),
          district,
          tehsil,
        });
        finalVillageId = created.id;
      }

      await register({
        full_name: fullName,
        email,
        password,
        role,
        village_id: finalVillageId,
        department_id: role === "government_officer" ? departmentId : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  const tehsilOptions = district ? SINDH_DISTRICTS_TEHSILS[district] ?? [] : [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg dark:bg-bg-dark px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white dark:bg-primary-dark">
            GS
          </span>
          <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
            Create your account
          </h1>
        </div>

        <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorBanner message={error} />}
            <div>
              <Label>Full name</Label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>I am a...</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="citizen">Citizen</option>
                <option value="government_officer">Government Officer</option>
                <option value="village_admin">Village Administrator</option>
              </Select>
              {role !== "citizen" && (
                <p className="mt-1.5 text-xs text-text-secondary">
                  Note: in production, Officer and Administrator accounts require
                  an invite code from an existing Administrator (PRD 10.9) — open
                  here only so you can try every role in this prototype.
                </p>
              )}
            </div>

            <div className="space-y-4 rounded-card border border-border dark:border-border-dark p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Your Location
              </p>

              <div>
                <Label>District</Label>
                <Select value={district} onChange={(e) => handleDistrictChange(e.target.value)}>
                  <option value="">Select a district</option>
                  {SINDH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              {district && (
                <div>
                  <Label>Tehsil</Label>
                  <Select value={tehsil} onChange={(e) => handleTehsilChange(e.target.value)}>
                    <option value="">Select a tehsil</option>
                    {tehsilOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {district && tehsil && (
                <div>
                  <Label>Village</Label>
                  <Select
                    value={villageId}
                    onChange={(e) => setVillageId(e.target.value)}
                    disabled={villagesLoading}
                  >
                    <option value="">
                      {villagesLoading ? "Loading villages…" : "Select your village"}
                    </option>
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                    <option value={ADD_NEW_VALUE}>My village isn&apos;t listed…</option>
                  </Select>
                </div>
              )}

              {isAddingNewVillage && (
                <div>
                  <Label>Your village&apos;s name</Label>
                  <Input
                    required
                    value={newVillageName}
                    onChange={(e) => setNewVillageName(e.target.value)}
                    placeholder="e.g. Goth Allah Bux"
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">
                    We&apos;ll add this village under {tehsil}, {district} so others from
                    the same area can find it too.
                  </p>
                </div>
              )}
            </div>

            {role === "government_officer" && villageId && !isAddingNewVillage && (
              <div>
                <Label>Department</Label>
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  {departments.length === 0 && <option value="">No departments yet</option>}
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary dark:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
