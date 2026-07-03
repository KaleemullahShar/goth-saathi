"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";
import Button from "@/components/Button";
import { Input, Label, ErrorBanner } from "@/components/ui";

const DEMO_ACCOUNTS = [
  { label: "Citizen — Amina Bhatti", email: "citizen@gothsaathi.pk" },
  { label: "Government Officer — Bilal Ahmed", email: "officer@gothsaathi.pk" },
  { label: "Village Administrator — Sana Memon", email: "admin@gothsaathi.pk" },
];
const DEMO_PASSWORD = "GothSaathi123!";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg dark:bg-bg-dark px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white dark:bg-primary-dark">
            GS
          </span>
          <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
            Goth Saathi
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Your Village&apos;s Intelligent Digital Companion
          </p>
        </div>

        <div className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorBanner message={error} />}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary dark:text-primary-dark">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-card border border-dashed border-border dark:border-border-dark p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Try a demo account
          </p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="block w-full rounded-card px-2 py-1.5 text-left text-sm text-text-primary hover:bg-black/5 dark:text-text-primaryDark dark:hover:bg-white/5"
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Password for all demo accounts: <code>{DEMO_PASSWORD}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
