"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/auth/sign-out";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-danger disabled:opacity-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
        <LogOut size={17} strokeWidth={1.8} />
      </div>
      <span>{loading ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
