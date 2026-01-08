export function launchConfetti({
  count = 70,
  colors = ["#F5C400", "#111111", "#0057FF", "#FF3B30", "#34C759"],
}: {
  count?: number;
  colors?: string[];
} = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Respect reduced motion preferences.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "9999";

  const startX = window.innerWidth / 2;
  const startY = Math.min(180, window.innerHeight * 0.25);

  const durationMs = 1100;
  const now = performance.now();

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.style.position = "absolute";
    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.width = `${6 + Math.random() * 6}px`;
    piece.style.height = `${6 + Math.random() * 10}px`;
    piece.style.borderRadius = `${Math.random() > 0.7 ? 999 : 2}px`;
    piece.style.background = colors[i % colors.length] ?? "#F5C400";
    piece.style.opacity = "1";

    const dx = (Math.random() - 0.5) * window.innerWidth * 0.6;
    const dy = 250 + Math.random() * 260;
    const rot0 = Math.random() * 180;
    const rot1 = rot0 + (Math.random() > 0.5 ? 720 : -720);

    const animation = piece.animate(
      [
        { transform: `translate(0px, 0px) rotate(${rot0}deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot1}deg)`, opacity: 0 },
      ],
      { duration: durationMs, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" },
    );

    // Ensure we don't leak nodes if the tab is backgrounded.
    animation.finished.catch(() => {}).finally(() => piece.remove());

    root.appendChild(piece);
  }

  document.body.appendChild(root);

  const cleanupDelay = Math.max(0, durationMs - (performance.now() - now)) + 100;
  window.setTimeout(() => root.remove(), cleanupDelay);
}

