import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, message, action, icon, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-hairline bg-cream/50 px-6 py-14 text-center ${className}`}>
      {icon && <div className="text-4xl">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-teal">{title}</h3>
      {message && <p className="max-w-sm text-sm text-secondary/80">{message}</p>}
      {action}
    </div>
  );
}
