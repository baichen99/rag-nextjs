import { useEffect, useRef } from "react";
import type { PlaybackMode } from "./useAudioPlayer";

const EXTS = [".wav", ".mp3", ".m4a"] as const;
/** Relative to full-scale file peak; keeps SFX under narration. */
const DEFAULT_SFX_VOLUME = 0.65;
const sfxUrlCache = new Map<string, Promise<string | null>>();

async function resolveSfxUrl(base: string): Promise<string | null> {
  if (!base) return null;
  const cached = sfxUrlCache.get(base);
  if (cached) return cached;

  const task = (async () => {
    for (const ext of EXTS) {
      const url = `${base}${ext}`;
      try {
        const resp = await fetch(url, { method: "HEAD", cache: "no-cache" });
        if (resp.ok) return url;
      } catch {
        // ignore and keep probing
      }
    }
    return null;
  })();

  sfxUrlCache.set(base, task);
  return task;
}

interface Options {
  baseSrc: string | null;
  mode: PlaybackMode;
  autoStarted: boolean;
}

/**
 * Runtime per-step SFX playback.
 * Looks for `public/sfx/<chapter-id>/<step>.(wav|mp3|m4a)`.
 * Non-blocking: does not drive auto-advance timing.
 */
export function useSfxPlayer({ baseSrc, mode, autoStarted }: Options) {
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const prev = sfxRef.current;
    if (prev) {
      prev.pause();
      prev.removeAttribute("src");
      prev.load();
      sfxRef.current = null;
    }

    if (!baseSrc || mode === "manual") return;
    if (mode === "auto" && !autoStarted) return;

    let cancelled = false;

    (async () => {
      const url = await resolveSfxUrl(baseSrc);
      if (!url || cancelled) return;
      const sfx = new Audio(url);
      sfx.preload = "auto";
      sfx.volume = DEFAULT_SFX_VOLUME;
      sfxRef.current = sfx;
      sfx.play().catch(() => {
        // Optional garnish; ignore autoplay/decode failures.
      });
    })();

    return () => {
      cancelled = true;
      const a = sfxRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
        sfxRef.current = null;
      }
    };
  }, [baseSrc, mode, autoStarted]);
}

