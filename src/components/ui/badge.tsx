import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Croply specific — tokens del design system (no hex hardcodeado)
        success:
          "border-green-100 bg-green-50 text-green-700",
        warning:
          "border-yellow-300 bg-yellow-50 text-yellow-800",
        error:
          "border-red-200 bg-red-50 text-red-800",
        neutral:
          "border-border bg-muted text-muted-foreground",
        info:
          "border-blue-200 bg-blue-50 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
