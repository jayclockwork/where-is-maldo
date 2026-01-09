import { NextResponse } from "next/server";

import { loadJourney } from "@/lib/journey/loadJourney";

export const dynamic = "force-static";
export const revalidate = 0;

export async function GET() {
  const journey = await loadJourney();
  return NextResponse.json(journey);
}


