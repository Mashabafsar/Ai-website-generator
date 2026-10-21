import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-primary-border bg-primary-surface text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-line-strong text-foreground",
        success: "border-success-border bg-success-surface text-success-pressed",
        warning: "border-secondary-border bg-secondary-surface text-secondary-pressed",
        destructive: "border-error-border bg-error-surface text-error-pressed",
        brand: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: Readonly<BadgeProps>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
