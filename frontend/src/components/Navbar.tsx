"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
}

export default function Navbar({ links }: { links: NavLink[] }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const data = await api.get<Notification[]>("/api/notifications");
        if (!cancelled) {
          setNotifs(data);
          setUnread(data.filter((n) => !n.is_read).length);
        }
      } catch {
        // silent — notification polling failure shouldn't break navigation
      }
    }
    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function openNotifs() {
    setShowNotifs((v) => !v);
    if (!showNotifs && unread > 0) {
      await api.post("/api/notifications/read-all");
      setUnread(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border dark:border-border-dark bg-surface/90 dark:bg-surface-dark/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white dark:bg-primary-dark">
              GS
            </span>
            <span className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
              Goth Saathi
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary dark:text-primary-dark"
                      : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={openNotifs}
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <BellIcon />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark shadow-lg">
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifs.length === 0 && (
                    <p className="p-4 text-center text-sm text-text-secondary">
                      No notifications yet.
                    </p>
                  )}
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-card p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {n.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
              {user?.full_name}
            </p>
            <p className="text-xs text-text-secondary capitalize">
              {user?.role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-card border border-border dark:border-border-dark px-3 py-2 text-sm font-medium text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border dark:border-border-dark px-4 py-2 md:hidden">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-card px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-primary/10 text-primary dark:text-primary-dark"
                  : "text-text-secondary"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-secondary"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
