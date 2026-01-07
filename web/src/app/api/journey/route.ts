import { NextResponse } from "next/server";

import { loadJourney } from "@/lib/journey/loadJourney";

export async function GET() {
  const journey = await loadJourney();
  return NextResponse.json(journey);
}


