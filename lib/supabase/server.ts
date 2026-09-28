import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key so server actions and
// server components can read/write freely — Clerk is the auth boundary,
// this key must never reach the browser bundle.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
