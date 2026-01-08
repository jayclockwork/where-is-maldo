export function phaseTitleToStepTitle(title: string): string {
  // We keep underlying IDs stable (they're derived from the phase name, not this display label),
  // but we want the UI to use “Step” instead of “Phase”.
  return title.replace(/^Phase\b/i, "Step");
}

