/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

// We use the provided credentials as a fallback to ensure it works immediately
// without requiring manual environment variable setup right now.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pzewxotypcycgcuhmjds.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_tcV4fUap0YB6AsjR0iWJsQ_fqA8ousk";

export const supabase = createClient(supabaseUrl, supabaseKey);
