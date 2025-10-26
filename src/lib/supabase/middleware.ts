import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except for auth routes)
  // Temporarily disabled for demo purposes
  // const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
  //                     request.nextUrl.pathname.startsWith("/signup") ||
  //                     request.nextUrl.pathname.startsWith("/forgot-password");
  
  // if (!user && !isAuthRoute) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  // Add user ID to headers for API routes
  if (request.nextUrl.pathname.startsWith("/api") && user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);

    const newResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Copy cookies from supabaseResponse to maintain session
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return newResponse;
  }

  return supabaseResponse;
}
