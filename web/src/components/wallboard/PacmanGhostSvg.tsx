export function PacmanGhostSvg({
  color,
  size = 26,
  pupilMotion,
}: {
  color: string;
  size?: number;
  pupilMotion?: { durSeconds: number; values: string; keyTimes: string } | null;
}) {
  // Drawn in a 64x64 coordinate space and scaled; centered on the motion point.
  const s = size / 64;
  return (
    <g transform={`translate(${-size / 2},${-size / 2}) scale(${s})`} aria-hidden>
      <path
        d="M16 28c0-11 7.2-20 16-20s16 9 16 20v28l-5-4-6 4-5-4-6 4-5-4-5 4V28z"
        fill={color}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="2"
      />
      <circle cx="26" cy="30" r="5" fill="#fff" />
      <circle cx="38" cy="30" r="5" fill="#fff" />
      <g>
        {pupilMotion ? (
          <animateTransform
            attributeName="transform"
            type="translate"
            dur={`${pupilMotion.durSeconds}s`}
            repeatCount="indefinite"
            calcMode="discrete"
            values={pupilMotion.values}
            keyTimes={pupilMotion.keyTimes}
          />
        ) : null}
        <circle cx="28" cy="30" r="2.2" fill="#111" />
        <circle cx="40" cy="30" r="2.2" fill="#111" />
      </g>
    </g>
  );
}

