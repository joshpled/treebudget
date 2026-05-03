type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="px-4 pb-3 pt-5">
      {eyebrow ? (
        <div className="text-[12px] font-medium uppercase tracking-wide text-muted">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="mt-1 text-[24px] font-semibold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-[14px] text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
