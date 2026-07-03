"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Button from "@/components/Button";
import { Input, Label, ErrorBanner, Select } from "@/components/ui";

interface Village {
  id: string;
  name: string;
  union_council: string | null;
}
interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [villageId, setVillageId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Village[]>("/api/villages").then((v) => {
      setVillages(v);
      if (v.length > 0) setVillageId(v[0].id);
    });
  }, []);

  useEffect(() => {
    if (!villageId) return;
    api
      .get<Department[]>(`/api/departments?village_id=${villageId}`)
      .then((d) => {
        setDepartments(d);
        if (d.length > 0) setDepartmentId(d[0].id);
      });
  }, [villageId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        village_id: villageId,
        department_id: role === "government_officer" ? departmentId : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

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
            <div>
              <Label>Village</Label>
              <Select value={villageId} onChange={(e) => setVillageId(e.target.value)}>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.union_council})
                  </option>
                ))}
              </Select>
            </div>
            {role === "government_officer" && (
              <div>
                <Label>Department</Label>
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
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
