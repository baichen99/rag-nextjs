import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wvp-subtitles";

function readSubtitlesFromURL(): boolean | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const cc = q.get("cc");
  const sub = q.get("subtitles");
  if (cc === "1" || sub === "1") return true;
  if (cc === "0" || sub === "0") return false;
  return null;
}

function readInitialEnabled(): boolean {
  const fromUrl = readSubtitlesFromURL();
  if (fromUrl !== null) return fromUrl;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function syncURL(enabled: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("cc");
  url.searchParams.delete("subtitles");
  if (enabled) url.searchParams.set("cc", "1");
  window.history.replaceState(null, "", url.toString());
}

function syncStorage(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/**
 * Burn-in style subtitles: shows current step's narration text on the 16:9 stage.
 * Initial state: `?cc=1` / `?subtitles=1` (or `=0` to force off), else localStorage.
 * Toggle updates URL + localStorage. Press `C` to toggle when not typing in an input.
 */
export function useSubtitles() {
  const [subtitlesEnabled, setSubtitlesEnabledState] = useState(readInitialEnabled);

  const setSubtitlesEnabled = useCallback((enabled: boolean) => {
    setSubtitlesEnabledState(enabled);
    syncStorage(enabled);
    syncURL(enabled);
  }, []);

  const toggleSubtitles = useCallback(() => {
    setSubtitlesEnabledState((prev) => {
      const next = !prev;
      syncStorage(next);
      syncURL(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        toggleSubtitles();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSubtitles]);

  return { subtitlesEnabled, setSubtitlesEnabled, toggleSubtitles };
}
