import type { Metadata, Viewport } from "next";
import { RouteProgress } from "@/components/RouteProgress";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "treebudget",
  description: "A calm, three-account budget app.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7f8f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ServiceWorkerRegistration />
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
