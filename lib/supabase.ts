import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
    if (_supabase) return _supabase;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Missing Supabase Environment Variables. Check .env.local');
        return null;
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
}

// Backward-compatible export (lazy initialization)
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        const client = getSupabase();
        if (!client) {
            console.warn('Supabase client not available. Missing env vars.');
            return () => ({ data: null, error: new Error('Supabase not configured') });
        }
        return (client as any)[prop];
    }
});
