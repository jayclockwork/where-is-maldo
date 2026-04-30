import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseJourneyYaml } from "@/lib/journey/parseJourneyYaml";
import type { JourneyDoc } from "@/lib/journey/types";

export async function loadJourney(): Promise<JourneyDoc> {
  // repo root: ../docs/journey.yaml
  const filePath = path.join(process.cwd(), "..", "docs", "journey.yaml");
  const yamlText = await readFile(filePath, "utf8");
  return parseJourneyYaml(yamlText);
}
