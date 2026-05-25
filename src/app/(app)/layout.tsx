import { BottomNav } from "@/components/BottomNav";
import { AppSidebar } from "@/components/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col lg:mx-0 lg:max-w-none">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
