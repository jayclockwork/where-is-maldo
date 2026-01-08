export function ghostDurationSeconds(ghostCount: number): number {
  // More ghosts => faster movement (shorter duration).
  // Keep within a sensible band so it never becomes chaotic or imperceptibly slow.
  const n = Math.max(0, ghostCount);
  const duration = 14 - n * 0.18;
  return clamp(duration, 4.5, 14);
}

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

