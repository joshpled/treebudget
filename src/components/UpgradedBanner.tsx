"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";

export function UpgradedBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") === "1") {
      setShow(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("upgraded");
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  if (!show) return null;

  return (
    <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-white shadow-card lg:mx-0">
      <Sparkles size={18} className="shrink-0" />
      <p className="flex-1 text-[14px] font-medium">
        Welcome to Premium! Bank sync, goals, and auto income split are now unlocked.
      </p>
      <button type="button" onClick={() => setShow(false)} className="shrink-0 opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}
