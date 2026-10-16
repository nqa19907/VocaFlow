import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

export async function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("SUPABASE_NOT_CONFIGURED");
  const jar = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* Server Components cannot write cookies; proxy refreshes them. */
        }
      },
    },
  });
}
