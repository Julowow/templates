import { createClient } from "@supabase/supabase-js";

// --- Init Supabase ---
// Requires: npm install @supabase/supabase-js
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- CRUD Examples ---

// SELECT with filters
async function getBySlug(table, slug) {
  const { data, error } = await supabase
    .from(table)
    .select("id, slug, title")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error(`Not found in ${table}: ${slug}`);
  }
  return data;
}

// INSERT with return
async function insertRow(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }
  return data;
}

// CALL stored procedure (RPC)
async function callRpc(fnName, params) {
  const { data, error } = await supabase.rpc(fnName, params);
  if (error) {
    throw new Error(`RPC ${fnName} failed: ${error.message}`);
  }
  return data;
}

export { supabase, getBySlug, insertRow, callRpc };
