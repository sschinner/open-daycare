import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const PUBLIC_ROUTES = ["/login", "/activate-account"];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

// A redirect drops whatever cookies the session refresh just wrote, so they are
// copied over from the pass-through response.
const redirectWithCookies = (url: URL, supabaseResponse: NextResponse) => {
  const response = NextResponse.redirect(url);

  supabaseResponse.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  return response;
};

export const updateSession = async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // Nothing may run between createServerClient and getClaims: it verifies the
  // access token and writes the refreshed one back to the request and response
  // cookies. Without it, server-rendered sessions expire and users get logged out.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }

    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("next", `${pathname}${search}`);

    return redirectWithCookies(loginUrl, supabaseResponse);
  }

  if (pathname === "/login") {
    return redirectWithCookies(new URL("/", request.url), supabaseResponse);
  }

  // A verified session without a profile cannot use the app, and only this
  // file can write cookies, so the session is closed here.
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();

    return redirectWithCookies(new URL("/login", request.url), supabaseResponse);
  }

  return supabaseResponse;
};
