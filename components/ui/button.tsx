import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-foreground text-primary-foreground hover:shadow-[0_12px_28px_-12px_rgba(10,8,8,0.55)]",
        accent:
          "rounded-full bg-accent text-[#f2e8df] hover:shadow-[0_12px_28px_-10px_rgba(194,74,42,0.4)]",
        outline:
          "rounded-full border border-border-strong bg-transparent text-foreground hover:border-accent hover:text-accent",
        ghost: "rounded-full text-fg-dim hover:bg-secondary hover:text-foreground",
        destructive: "rounded-full bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
