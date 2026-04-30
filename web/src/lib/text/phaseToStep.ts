export function phaseTitleToStepTitle(title: string): string {
  // We keep underlying IDs stable (they're derived from the phase name, not this display label),
  // but we want the UI to use “Level” instead of “Phase”.
  return title.replace(/^Phase\b/i, "Level");
}

/**
 * Split a display title like `Level 2: Build` into the numeric level label and the name.
 * Used to de-emphasize the “Level N” prefix in headings. Returns null if the pattern does not match.
 */
export function splitPhaseTitleForDisplay(displayTitle: string): { prefix: string; name: string } | null {
  const m = displayTitle.match(/^((?:level|phase|step)\s+\d+)\s*:\s*(.+)$/i);
  if (!m) return null;
  const name = (m[2] ?? "").trim();
  if (!name) return null;
  return { prefix: m[1], name };
}

