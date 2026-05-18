import { useCallback, useEffect, useState } from "react";
import type { PlaybackMode } from "../hooks/useAudioPlayer";
import type { ChapterDef } from "../registry/types";
import "./ControlPanel.css";

interface Cursor {
  chapter: number;
  step: number;
}

interface Props {
  chapters: ChapterDef[];
  cursor: Cursor;
  globalIndex: number;
  totalGlobal: number;
  mode: PlaybackMode;
  autoStarted: boolean;
  subtitlesEnabled: boolean;
  onSubtitlesChange: (enabled: boolean) => void;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpChapter: (idx: number, step?: number) => void;
}

const MODE_LABEL: Record<PlaybackMode, string> = {
  manual: "手动",
  audio: "音频",
  auto: "自动",
};

const MODE_COLOR: Record<PlaybackMode, string> = {
  manual: "var(--text-mute)",
  audio: "#facc15",
  auto: "var(--accent)",
};

/**
 * Right-side control panel for playback control and info display.
 * Collapsible — shows a thin trigger strip when collapsed,
 * expands on hover to reveal full controls.
 */
export function ControlPanel({
  chapters,
  cursor,
  globalIndex,
  totalGlobal,
  mode,
  autoStarted,
  subtitlesEnabled,
  onSubtitlesChange,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onJumpChapter,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const ch = chapters[cursor.chapter]!;
  const isPlaying = mode === "auto" && autoStarted;

  const togglePlay = useCallback(() => {
    if (isPlaying) onPause();
    else onPlay();
  }, [isPlaying, onPlay, onPause]);

  // Keyboard: Space toggles play/pause when panel is focused or globally
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === " ") {
        // Don't intercept space if auto gate is visible (let gate handle it)
        if (mode === "auto" && !autoStarted) return;
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, mode, autoStarted]);

  return (
    <div
      className={`cp-root ${expanded ? "cp-expanded" : ""}`}
      data-no-advance
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Collapsed trigger strip */}
      <div className="cp-trigger">
        <div className="cp-trigger-line" />
        <span className="cp-trigger-icon">▸</span>
      </div>

      {/* Expanded panel */}
      <div className="cp-panel">
        <div className="cp-header">
          <span className="cp-title">控制</span>
          <button
            className="cp-close"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
          >
            ✕
          </button>
        </div>

        {/* Play/Pause — big button */}
        <div className="cp-play-section">
          <button
            className={`cp-play-btn ${isPlaying ? "cp-playing" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            title={isPlaying ? "暂停" : "开始自动播放"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <span className="cp-play-label">
            {isPlaying ? "播放中" : "已暂停"}
          </span>
        </div>

        {/* Mode badge */}
        <div
          className="cp-mode-badge"
          style={{ color: MODE_COLOR[mode] }}
        >
          <span className="cp-mode-dot" style={{ background: MODE_COLOR[mode] }} />
          {MODE_LABEL[mode]} 模式
        </div>

        {/* Subtitles — same text as narrations.ts / TTS */}
        <label className="cp-subtitles-row" data-no-advance>
          <span className="cp-subtitles-label">字幕</span>
          <button
            type="button"
            role="switch"
            aria-checked={subtitlesEnabled}
            className={`cp-toggle ${subtitlesEnabled ? "cp-toggle-on" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSubtitlesChange(!subtitlesEnabled);
            }}
          >
            <span className="cp-toggle-knob" />
          </button>
        </label>

        {/* Chapter info */}
        <div className="cp-info-section">
          <div className="cp-info-row">
            <span className="cp-info-label">章节</span>
            <span className="cp-info-value">{ch.title}</span>
          </div>
          <div className="cp-info-row">
            <span className="cp-info-label">Step</span>
            <span className="cp-info-value">
              {cursor.step + 1} / {ch.narrations.length}
            </span>
          </div>
          <div className="cp-info-row">
            <span className="cp-info-label">全局</span>
            <span className="cp-info-value">
              {globalIndex + 1} / {totalGlobal}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="cp-progress-section">
          <div className="cp-progress-track">
            <div
              className="cp-progress-fill"
              style={{
                width: `${totalGlobal > 1 ? (globalIndex / (totalGlobal - 1)) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Nav buttons */}
        <div className="cp-nav">
          <button
            className="cp-nav-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            disabled={globalIndex <= 0}
            title="上一页 (←)"
          >
            ←
          </button>
          <button
            className="cp-nav-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={globalIndex >= totalGlobal - 1}
            title="下一页 (→)"
          >
            →
          </button>
        </div>

        {/* Chapter quick jump */}
        <div className="cp-chapters">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              className={`cp-chapter-pill ${i === cursor.chapter ? "cp-chapter-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onJumpChapter(i, 0);
              }}
              title={c.title}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* Shortcuts hint */}
        <div className="cp-hint">
          <div className="cp-hint-line">M 切换模式</div>
          <div className="cp-hint-line">C 开/关字幕</div>
          <div className="cp-hint-line">Space 播放/暂停</div>
          <div className="cp-hint-line">← → 翻页</div>
        </div>
      </div>
    </div>
  );
}
