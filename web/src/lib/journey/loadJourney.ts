import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseJourneyMarkdown } from "@/lib/journey/parseJourney";
import type { JourneyDoc } from "@/lib/journey/types";

export async function loadJourney(): Promise<JourneyDoc> {
  // repo root: ../docs/journey.md
  const filePath = path.join(process.cwd(), "..", "docs", "journey.md");
  const markdown = await readFile(filePath, "utf8");
  return parseJourneyMarkdown(markdown);
}


