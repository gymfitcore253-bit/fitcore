import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This proxy runs on every non-static request and has one job:
// refresh the Supabase session token before it expires, then write the
// updated token back into the response cookies so the browser keeps it.
//
// Without this, an expired token causes auth.uid() to become null on the
// server, which triggers RLS policy violations even when the user is
// "logged in" from the browser's perspective.
//
// (In Next.js 16 this file convention was renamed from `middleware` to `proxy`.)
export async function proxy(request: NextRequest) {
  // Start with a plain pass-through response. The setAll callback below
  // replaces this with a new response that carries updated cookie headers.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: write the new cookie values onto the request object so
          // any subsequent proxy in the chain sees the updated session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response with the mutated request, then write
          // the same cookies onto the response so the browser stores them.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not put any logic between createServerClient and getUser().
  // getUser() is the call that actually validates and refreshes the token.
  // Anything in between could prevent the refreshed cookies from being set.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except Next.js build artifacts and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
