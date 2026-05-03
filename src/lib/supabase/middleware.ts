import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/auth/sign-out",
  "/auth/check-email",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
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

  return response;
}
