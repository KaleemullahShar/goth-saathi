"use client";

import RoleGuard from "@/components/RoleGuard";
import Navbar from "@/components/Navbar";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/complaints", label: "All Complaints" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["village_admin"]}>
      <div className="min-h-screen bg-bg dark:bg-bg-dark">
        <Navbar links={LINKS} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
