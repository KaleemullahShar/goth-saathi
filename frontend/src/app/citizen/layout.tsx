"use client";

import RoleGuard from "@/components/RoleGuard";
import Navbar from "@/components/Navbar";

const LINKS = [
  { href: "/citizen", label: "Dashboard" },
  { href: "/citizen/complaints", label: "My Complaints" },
  { href: "/citizen/announcements", label: "Announcements" },
];

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["citizen"]}>
      <div className="min-h-screen bg-bg dark:bg-bg-dark">
        <Navbar links={LINKS} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
