import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-secondary text-fg-dim",
        secondary: "border-border bg-secondary text-fg-dim",
        draft: "border-border bg-secondary text-fg-dim",
        review:
          "border-[color-mix(in_oklab,var(--accent-2)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_14%,transparent)] text-[#b3a9ff]",
        approved:
          "border-[color-mix(in_oklab,var(--accent-3)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent-3)_14%,transparent)] text-[#4fe3c2]",
        failed:
          "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[#ff8a84]",
        accent:
          "border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[#ff9c6e]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
