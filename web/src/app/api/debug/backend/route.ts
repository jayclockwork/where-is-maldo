import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const backend = hasUrl && hasKey ? "supabase" : "in-memory";
  const supabaseHost = hasUrl ? new URL(process.env.SUPABASE_URL!).host : null;
  return NextResponse.json({ backend, hasSupabaseUrl: hasUrl, hasServiceRoleKey: hasKey, supabaseHost });
}

