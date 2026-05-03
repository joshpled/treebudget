import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, id, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </span>
      <input
        id={fieldId}
        {...rest}
        className={cn(
          "block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-ink shadow-card focus:border-primary focus:outline-none",
          error && "border-danger focus:border-danger",
          className,
        )}
      />
      {error ? (
        <span className="mt-1 block text-[12px] text-danger">{error}</span>
      ) : null}
    </label>
  );
}
