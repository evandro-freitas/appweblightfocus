import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente para o Supabase EXTERNO do usuário (não usa Lovable Cloud).
// Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.
// Sem essas variáveis, o app funciona 100% em memória com os dados de exemplo.
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const supabaseExternal: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const isSupabaseConfigured = Boolean(url && anonKey);
