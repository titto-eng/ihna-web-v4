import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-[15px] font-semibold whitespace-nowrap transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Orange fill with ink text (4.7:1); hover darkens with light text (5.7:1). 05 §4.1.
        default: "bg-primary text-foreground hover:-translate-y-0.5 hover:bg-primary-strong hover:text-primary-foreground",
        ink: "bg-foreground text-background hover:-translate-y-0.5 hover:bg-foreground/85",
        light: "bg-background text-foreground hover:-translate-y-0.5 hover:bg-background/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-current bg-transparent hover:-translate-y-0.5 hover:bg-foreground/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "rounded-none px-0 underline decoration-secondary decoration-2 underline-offset-8 hover:decoration-primary",
      },
      size: {
        default: "h-12 px-6",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-9 gap-1.5 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
