import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  size?: number;
};

export function TreeMark({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <path
        d="M16 3.5c-3.6 3.7-5.6 7.4-5.6 10.7 0 2.4 1.1 4.4 3 5.6V22H8.6a1 1 0 0 0 0 2h5.8v4.5a1.6 1.6 0 0 0 3.2 0V24h5.8a1 1 0 0 0 0-2h-5.8v-2.2c1.9-1.2 3-3.2 3-5.6 0-3.3-2-7-5.6-10.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
