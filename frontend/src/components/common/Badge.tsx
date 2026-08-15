import type { ReactNode } from "react";

type BadgeVariant = "new" | "bestseller" | "info" | "success" | "danger";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  new: "bg-magenta text-white",
  bestseller: "bg-gold text-teal",
  info: "bg-gold/15 text-teal",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-700",
};

export default function Badge({
  variant = "info",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </span>
  );
}
