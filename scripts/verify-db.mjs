import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing Supabase configuration in environment variables");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function verifyTables() {
  console.log("🔍 Verifying Supabase tables for LoomNotes AI...\n");

  const tables = ["profiles", "meetings", "action_items", "key_takeaways"];
  const results = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);

    if (error && error.message.includes("Could not find the table")) {
      results[table] = { status: "MISSING", message: error.message };
    } else if (error) {
      results[table] = { status: "EXISTS (RLS Active)", message: error.message };
    } else {
      results[table] = { status: "EXISTS", message: "Table reachable" };
    }
  }

  console.table(results);

  const missing = Object.entries(results).filter(
    ([_, res]) => res.status === "MISSING"
  );

  if (missing.length > 0) {
    console.log(`\n❌ ${missing.length} table(s) not found in Supabase schema cache.`);
    process.exit(1);
  } else {
    console.log("\n✅ All 4 tables verified successfully in Supabase!");
    process.exit(0);
  }
}

verifyTables();
