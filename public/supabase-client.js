// Each page loads the Supabase library and generated config before this file.
const config = window.SLIPLESS_SUPABASE_CONFIG;
if (!config || !config.url || !config.anonKey) {
    throw new Error("Supabase config is missing. Run node scripts/generate-config.js after setting up .env.");
}

// The anon/publishable key is intended for browser use; Supabase access must be protected by Row Level Security.
// Use a distinct name so this client does not clash with the Supabase library's global `supabase`.
const supabaseClient = supabase.createClient(config.url, config.anonKey);
