import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this client in Server Components, Route Handlers, and Server Actions —
// anywhere that runs on the server and has access to Next.js's cookies() API.
//
// createServerClient reads the auth token from the incoming request's cookies
// so the server always sees the same session the browser has. This is what
// makes auth.uid() return the correct value inside Supabase RLS policies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies directly — the middleware
            // handles token refresh, so this catch branch is a normal no-op
            // when called from a Server Component.
          }
        },
      },
    }
  );
}
