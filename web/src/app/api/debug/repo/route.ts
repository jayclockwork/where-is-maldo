import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const supabaseUrlPresent = !!process.env.SUPABASE_URL;
  const serviceRoleKeyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const repo = supabaseUrlPresent && serviceRoleKeyPresent ? "supabase" : "inmemory";

  return NextResponse.json({
    repo,
    supabaseUrlPresent,
    serviceRoleKeyPresent,
  });
}

