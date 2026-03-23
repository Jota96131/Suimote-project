import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// DevTools Consoleからアクセス可能にする（ログアウト等のテスト用）
(window as unknown as Record<string, unknown>).supabase = supabase;
