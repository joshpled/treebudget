import { TreeMark } from "@/components/TreeMark";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-screen flex-col px-5 pb-8 pt-12">
      <div className="flex items-center gap-2">
        <TreeMark size={24} />
        <span className="text-[15px] font-semibold tracking-tight">
          treebudget
        </span>
      </div>
      <div className="mt-10">
        <h1 className="text-[28px] font-semibold leading-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-8 flex-1">{children}</div>
      {footer ? (
        <div className="pt-6 text-center text-[13px] text-muted">{footer}</div>
      ) : null}
    </div>
  );
}
