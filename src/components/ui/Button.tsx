import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-gradient text-white hover:opacity-90 focus-visible:ring-primary-450",
        secondary: "bg-secondary-stone text-gray-900 hover:bg-secondary-stone/80 focus-visible:ring-secondary-stone",
        outline: "border-2 border-primary-200 bg-transparent hover:bg-primary-50 text-primary-450",
        ghost: "hover:bg-primary-50 text-primary-450",
        link: "underline-offset-4 hover:underline text-primary-450",
        destructive: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-400",
        success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-400",
        warning: "bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-400",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };