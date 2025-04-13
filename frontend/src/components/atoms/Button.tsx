import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center transition-all justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
        neutral:
          "bg-background-900 text-text-100 border border-background-600/75 hover:bg-background-700 active:bg-background-800 focus-visible:ring-background-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
        destructive:
          "bg-error hover:bg-error/90 active:bg-error/80 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
        outline:
          "border border-text-100 hover:bg-text-100 hover:text-text-900 active:bg-text-200 focus-visible:ring-text-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
        ghost:
          "hover:bg-background-600 active:bg-background-700 focus-visible:ring-background-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
        link: "text-100 underline underline-offset-4 hover:decoration-text-100 decoration-transparent focus-visible:ring-text-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900 outline-none focus-visible:ring-2",
      },
      size: {
        default: "px-3 py-2",
        sm: "rounded-md px-3 py-1.5 text-sm",
        lg: "rounded-md px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          disabled && "pointer-events-none opacity-50",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
