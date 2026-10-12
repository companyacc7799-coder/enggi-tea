const { createClient } = require("@supabase/supabase-js");

// Create Supabase connection using values from .env
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log("Supabase client initialized successfully");

module.exports = supabase;