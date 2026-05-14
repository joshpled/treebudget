"use client";

/**
 * Light haptic tap. iOS Safari respects navigator.vibrate inside a PWA
 * (and from iOS 18 in regular Safari for limited durations). Android
 * Chrome supports it everywhere. Elsewhere it's a no-op.
 *
 * Always call from within a user gesture handler — the browser will
 * silently drop calls outside one.
 */
export function haptic(durationMs: number = 10) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(durationMs);
  } catch {
    // Some browsers throw if vibrate is disabled by site settings — ignore.
  }
}
