'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "",
        success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
        warning: "border-amber-500/40 bg-amber-500/10 text-amber-700",
        destructive: "border-destructive/40 bg-destructive/10 text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, onDismiss, ...props }, ref) => (
    <div ref={ref} className={cn(toastVariants({ variant }), className)} role="status" {...props}>
      <div className="flex-1">
        {title ? <div className="font-semibold">{title}</div> : null}
        {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
      </div>
      {action}
      {onDismiss ? (
        <button
          onClick={onDismiss}
          className="rounded-md border border-transparent px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          ✕
        </button>
      ) : null}
    </div>
  )
);
Toast.displayName = "Toast";
