import { TopBar } from "@/components/TopBar";
import { NotificationSettings } from "@/components/NotificationSettings";

export default function NotificationsPage() {
  return (
    <>
      <TopBar back={{ href: "/settings", label: "Settings" }} title="Notifications" />
      <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:px-8">
        <NotificationSettings />
      </div>
    </>
  );
}
