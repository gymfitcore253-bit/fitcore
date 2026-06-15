import { createBrowserClient } from "@supabase/ssr";

// Use this client in any "use client" component.
//
// createBrowserClient stores the Supabase session in a cookie (not localStorage),
// so the same token is visible to the middleware and server components on every
// request. It caches the instance internally, so calling createClient() multiple
// times is safe and returns the same underlying client.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
