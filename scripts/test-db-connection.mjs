const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  meetings_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_month UNIQUE (user_id, month),
  CONSTRAINT non_negative_meetings CHECK (meetings_generated >= 0)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON public.usage_tracking(user_id, month);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage tracking"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can insert their own usage tracking"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can update their own usage tracking"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);
`;

async function trySql() {
  console.log("Trying /rest/v1/rpc/exec_sql or similar...");
  
  // Try Postgres query endpoint or pg-meta
  const endpoints = [
    `${supabaseUrl}/rest/v1/rpc/exec_sql`,
    `${supabaseUrl}/pg/query`,
    `https://api.supabase.com/v1/projects/tzlhscnzwpnxslllsdpx/database/query`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: sql, sql: sql })
      });
      console.log(`Endpoint: ${endpoint} -> status: ${res.status}`);
      const text = await res.text();
      console.log(`Response: ${text.slice(0, 200)}`);
    } catch (e) {
      console.log(`Endpoint: ${endpoint} error:`, e.message);
    }
  }
}

trySql();
