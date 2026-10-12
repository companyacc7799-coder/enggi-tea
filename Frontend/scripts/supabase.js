const SUPABASE_URL = "https://oeczqbbdjifhyobhhcys.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7Mt2qUoOUlgNnHwWN6OUDw__Q9i1DrJ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);