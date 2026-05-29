"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, id, type, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </span>
      <div className="relative">
        <input
          id={fieldId}
          type={isPassword && showPassword ? "text" : type}
          {...rest}
          className={cn(
            "block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-ink shadow-card focus:border-primary focus:outline-none",
            isPassword && "pr-11",
            error && "border-danger focus:border-danger",
            className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.75} />
            ) : (
              <Eye size={18} strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
      {error ? (
        <span className="mt-1 block text-[12px] text-danger">{error}</span>
      ) : null}
    </label>
  );
}
