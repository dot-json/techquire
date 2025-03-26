import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      description,
      error,
      containerClassName,
      labelClassName,
      id,
      ...props
    },
    ref,
  ) => {
    // Generate a unique ID for the input if not provided
    const inputId = id || React.useId();

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-text-300",
              error && "text-red-500",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-background-600/75 bg-background-900/50 px-3 py-2 text-base outline-none transition-all placeholder:text-background-500 focus:border-background-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {description && (
          <span className="text-xs text-text-500">{description}</span>
        )}

        {error && (
          <span id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
