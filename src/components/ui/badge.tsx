import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
  outline: "border border-[hsl(var(--border))]",
  muted: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  sale: "bg-red-600 text-white",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
