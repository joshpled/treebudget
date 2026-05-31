"use client";

import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";
import { TopBar } from "@/components/TopBar";

const options: { value: Theme; label: string; description: string; Icon: typeof Monitor }[] = [
  { value: "system", label: "System", description: "Matches your device setting", Icon: Monitor },
  { value: "light", label: "Light", description: "Always light", Icon: Sun },
  { value: "dark", label: "Dark", description: "Always dark", Icon: Moon },
];

export function AppearanceView() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <TopBar back={{ href: "/settings", label: "Settings" }} title="Appearance" />
      <div className="mx-auto w-full max-w-md px-4 lg:max-w-2xl lg:px-8">

        <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-card">
          {options.map(({ value, label, description, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-ink">{label}</div>
                <div className="text-[12px] text-muted">{description}</div>
              </div>
              {theme === value && (
                <Check size={16} className="text-primary" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
