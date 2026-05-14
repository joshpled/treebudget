import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/auth/sign-out",
  "/check-email",
  "/api/plaid/webhook",
];

const ONBOARDING_EXEMPT = [
  "/onboarding",
  "/auth/callback",
  "/auth/sign-out",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isOnboardingExempt(pathname: string) {
  return ONBOARDING_EXEMPT.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = "/sign-in";
    redirectTo.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(redirectTo);
  }

  if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = "/";
    redirectTo.search = "";
    return NextResponse.redirect(redirectTo);
  }

  // First-time signed-in users land on onboarding until they finish.
  if (user && !isPublicPath(pathname) && !isOnboardingExempt(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && !profile.onboarded_at) {
      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = "/onboarding";
      redirectTo.search = "";
      return NextResponse.redirect(redirectTo);
    }
  }

  return response;
}
