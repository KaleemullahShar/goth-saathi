import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border dark:border-border-dark py-14 px-6 text-center">
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-primary-dark">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-text-primary dark:text-text-primaryDark">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm text-text-secondary dark:text-text-secondaryDark">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-card bg-black/5 dark:bg-white/5 ${className}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-text-primaryDark">
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full min-h-[48px] rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 text-sm text-text-primary dark:text-text-primaryDark placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className || ""}`}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-3 text-sm text-text-primary dark:text-text-primaryDark placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className || ""}`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={`w-full min-h-[48px] rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 text-sm text-text-primary dark:text-text-primaryDark focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className || ""}`}
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
