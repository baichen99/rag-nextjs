import "./SubtitleBar.css";

interface Props {
  /** Current step narration — same string as TTS / `narrations[i]`. */
  text: string;
  visible: boolean;
}

/**
 * Bottom-centered caption strip inside the 16:9 frame. `pointer-events: none`
 * so clicks still advance the step. Z-index above `.scene` so text stays legible.
 */
export function SubtitleBar({ text, visible }: Props) {
  const t = text.trim();
  if (!visible || !t) return null;

  return (
    <div className="subtitle-bar" aria-live="polite">
      <p className="subtitle-bar-text">{t}</p>
    </div>
  );
}
