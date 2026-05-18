import { useEffect, useState } from "react";

function computeScale(
  baseW: number,
  baseH: number,
  marginX: number,
  marginY: number,
): number {
  if (typeof window === "undefined") return 1;
  const usefulW = Math.max(320, window.innerWidth - marginX * 2);
  const usefulH = Math.max(180, window.innerHeight - marginY * 2);
  return Math.min(usefulW / baseW, usefulH / baseH);
}

/**
 * Fit a 1920×1080 stage inside the viewport (letterboxed), as large as possible.
 *
 * Default margins are **0** so the stage fills the screen edge-to-edge on the
 * limiting axis; progress bar / corner controls are `position: fixed` on the
 * viewport and sit above the shell. Pass small positive margins if you want
 * breathing room or to keep shadows fully visible.
 */
export function useStageScale(
  baseW = 1920,
  baseH = 1080,
  marginX = 0,
  marginY = 0,
) {
  const [scale, setScale] = useState(() =>
    computeScale(baseW, baseH, marginX, marginY),
  );

  useEffect(() => {
    function update() {
      setScale(computeScale(baseW, baseH, marginX, marginY));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseW, baseH, marginX, marginY]);

  return scale;
}
