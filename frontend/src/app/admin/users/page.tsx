"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { Card, Skeleton, EmptyState } from "@/components/ui";

const ROLE_LABELS: Record<string, string> = {
  citizen: "Citizen",
  government_officer: "Government Officer",
  village_admin: "Village Administrator",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    api.get<User[]>("/api/admin/users").then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary dark:text-text-primaryDark">
          Users
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Everyone registered in your village.
        </p>
      </div>

      {users === null ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" description="Registered users will appear here." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 dark:border-border-dark">
                  <td className="px-4 py-3 font-medium text-text-primary dark:text-text-primaryDark">
                    {u.full_name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{ROLE_LABELS[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
