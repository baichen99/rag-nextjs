import type { ChapterDef } from "../registry/types";

export interface TimelineSegment {
  globalIdx: number;
  chapterId: string;
  step: number;
  audioPath: string | null;
  durationMs: number;
}

export interface VideoController {
  setGlobalStep: (globalIdx: number) => void;
  getTimeline: () => TimelineSegment[];
  isReady: () => boolean;
  totalSteps: () => number;
}

/**
 * Install a global controller on `window.__videoController` so that the
 * headless renderer (wvp-render) can drive the presentation directly,
 * bypassing audio playback and real-time delays.
 *
 * Only mounted when the URL contains `?render=1`.
 *
 * NOTE: empty narration strings are skipped so that global indices stay
 * in sync with audio-segments.json (which also skips silent steps).
 * This is a hard requirement — if the two lists diverge, the rendered
 * video will show the wrong step for every segment after the first empty
 * narration (off-by-one error that compounds across the timeline).
 */
export function installVideoController(
  chapters: ChapterDef[],
  setGlobalIdx: (idx: number) => void,
): void {
  if (typeof window === "undefined") return;

  const timeline: TimelineSegment[] = [];
  let globalIdx = 0;

  for (const ch of chapters) {
    for (let step = 1; step <= ch.narrations.length; step++) {
      const narration = ch.narrations[step - 1];
      // Skip silent steps — must match extract-narrations.ts behaviour
      if (typeof narration !== "string" || narration.trim() === "") {
        continue;
      }
      timeline.push({
        globalIdx: globalIdx++,
        chapterId: ch.id,
        step,
        audioPath: `/audio/${ch.id}/${step}.mp3`,
        durationMs: 0,
      });
    }
  }

  (window as unknown as { __videoController: VideoController }).__videoController = {
    setGlobalStep(idx) {
      if (idx < 0 || idx >= timeline.length) return;
      setGlobalIdx(idx);
    },
    getTimeline() {
      return timeline;
    },
    isReady() {
      return true;
    },
    totalSteps() {
      return timeline.length;
    },
  };
}
