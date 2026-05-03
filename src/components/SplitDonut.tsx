"use client";

type Slice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

export function SplitDonut({
  slices,
  size = 140,
  thickness = 16,
  centerLabel,
  centerValue,
}: Props) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={thickness}
        />
        {slices.map((s) => {
          const fraction = s.value / total;
          const length = circumference * fraction;
          const dasharray = `${length} ${circumference - length}`;
          const dashoffset = -offset;
          offset += length;
          return (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
            />
          );
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {centerLabel || centerValue ? (
          <div className="mb-1">
            {centerLabel ? (
              <div className="text-[11px] uppercase tracking-wide text-muted">
                {centerLabel}
              </div>
            ) : null}
            {centerValue ? (
              <div className="tabular text-[20px] font-semibold">
                {centerValue}
              </div>
            ) : null}
          </div>
        ) : null}
        {slices.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between text-[13px]"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-ink">{s.label}</span>
            </span>
            <span className="tabular font-medium text-muted">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
