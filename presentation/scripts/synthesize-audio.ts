#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────
// synthesize-audio.ts — read audio-segments.json and call Volcengine TTS
// (ByteDance OpenSpeech API) to produce one mp3 per segment under
// public/audio/<chapter>/<N>.mp3.
//
// Prereq:
//   1. npm run extract-narrations   (writes audio-segments.json)
//   2. Volcengine credentials in settings.json or env vars
//
// Behavior:
//   • Serial calls (TTS APIs commonly rate-limit parallel requests).
//   • Skips segments whose mp3 already exists (so you can rerun safely
//     after a partial failure). Pass --force to re-synthesize all.
//   • Prints progress per segment with elapsed time.
//
// Usage:
//   tsx scripts/synthesize-audio.ts                # incremental
//   tsx scripts/synthesize-audio.ts --force        # overwrite all
//   tsx scripts/synthesize-audio.ts --voice=<id>   # override voice
// ─────────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const SEGMENTS = resolve(ROOT, "audio-segments.json");
const OUT_DIR = resolve(ROOT, "public/audio");
const SETTINGS_PATH = resolve(ROOT, "settings.json");

const TTS_URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const DEFAULT_VOICE = "zh_male_wennuanahu_uranus_bigtts";
const DEFAULT_RESOURCE_ID = "seed-tts-2.0";

interface Segment {
  chapter: string;
  step: number;
  text: string;
  audio: string;
}

function loadSettings(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function ttsErrorHint(errBody: string): string {
  try {
    const o = JSON.parse(errBody) as { code?: number; message?: string };
    const msg = String(o.message ?? "");
    if (o.code === 45000000 && msg.includes("access denied")) {
      return "\n---\n[说明] 音色或资源未授权，请检查 X-Api-Resource-Id 与 speaker 是否都已开通授权。";
    }
    if (msg.includes("quota exceeded")) {
      return "\n---\n[说明] 当前并发或配额不足，请稍后重试，或提升配额。";
    }
    return "";
  } catch {
    return "";
  }
}

function readJsonObjects(buffer: string): { objects: Array<Record<string, unknown>>; rest: string } {
  const objects: Array<Record<string, unknown>> = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;
  let lastEnd = 0;

  for (let i = 0; i < buffer.length; i++) {
    const ch = buffer[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }
    if (ch === "}") {
      if (depth > 0) depth -= 1;
      if (depth === 0 && start >= 0) {
        const raw = buffer.slice(start, i + 1);
        try {
          const obj = JSON.parse(raw) as Record<string, unknown>;
          objects.push(obj);
        } catch {
          // ignore broken json piece; keep scanning remaining stream
        }
        lastEnd = i + 1;
        start = -1;
      }
    }
  }

  if (depth > 0 && start >= 0) return { objects, rest: buffer.slice(start) };
  return { objects, rest: buffer.slice(lastEnd) };
}

// Pre-process narration text before sending to TTS to avoid mispronunciations.
// Common issues: camelCase words, slashes in abbreviations, and compound tech terms.
function preprocessTTS(text: string): string {
  return (
    text
      // CamelCase / PascalCase: insert space before uppercase letters (except first char)
      // This fixes "WebSocket" → "Web Socket", "JavaScript" → "Java Script", etc.
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Tech abbreviations with slash: replace with space
      // HTTP/3 → "HTTP 3", TCP/IP → "TCP IP", REST/API → "REST API", etc.
      .replace(/\b([A-Z]{2,})\/([A-Z0-9]+)\b/g, "$1 $2")
      // Standalone slash between letters (e.g. "client/server") → space
      .replace(/([a-zA-Z])\/([a-zA-Z])/g, "$1 $2")
      // Double spaces → single space
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

async function ttsChunk(
  creds: {
    appid: string;
    token: string;
    apiKey: string;
    resourceId: string;
    voice: string;
    encoding: string;
  },
  rawText: string,
): Promise<Uint8Array> {
  const text = preprocessTTS(rawText);
  const body = {
    user: { uid: "web-video-presentation" },
    req_params: {
      speaker: creds.voice,
      audio_params: { format: creds.encoding, sample_rate: 24000 },
      text,
    },
  };

  const requestId = crypto.randomUUID();
  const headers: Record<string, string> = {
    "X-Api-Resource-Id": creds.resourceId,
    "X-Api-Request-Id": requestId,
    "Content-Type": "application/json",
    Accept: "*/*",
    "User-Agent": "web-video-presentation-synthesize-audio/1.0",
  };

  if (creds.apiKey) {
    headers["X-Api-Key"] = creds.apiKey;
  } else {
    headers["X-Api-App-Id"] = creds.appid;
    headers["X-Api-Access-Key"] = creds.token;
  }

  const resp = await fetch(TTS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${raw}${ttsErrorHint(raw)}`);
  }
  if (!resp.body) throw new Error("响应无 body（流式数据为空）");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const parts: Buffer[] = [];
  let sawFinish = false;
  let errorMessage = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parsed = readJsonObjects(buf);
    buf = parsed.rest;
    for (const obj of parsed.objects) {
      const code = Number(obj.code ?? -1);
      const message = String(obj.message ?? "");
      const data = obj.data;
      if (typeof data === "string" && data) {
        parts.push(Buffer.from(data, "base64"));
      }
      if (code === 20000000) {
        sawFinish = true;
        continue;
      }
      if (code !== 0) {
        errorMessage = `TTS 错误 code=${code}: ${message || JSON.stringify(obj)}`;
      }
    }
  }

  if (errorMessage) throw new Error(`${errorMessage}${ttsErrorHint(JSON.stringify({ message: errorMessage }))}`);
  if (!parts.length) throw new Error("未收到任何音频分片");
  if (!sawFinish) console.error("[Warn] 未检测到 SessionFinish(20000000)，已按收到的音频数据继续。");
  return Uint8Array.from(Buffer.concat(parts));
}

function getCredentials(): {
  appid: string;
  token: string;
  apiKey: string;
  voice: string;
  encoding: string;
  resourceId: string;
} {
  const settings = loadSettings(SETTINGS_PATH);

  const envOrFlat = (name: string): string => {
    const ev = process.env[name];
    if (ev?.trim()) return ev.trim();
    const fv = settings[name];
    if (typeof fv === "string" && fv.trim()) return fv.trim();
    return "";
  };

  const vt = (settings.volc_tts ?? {}) as Record<string, unknown>;
  const nested = (...keys: string[]): string => {
    for (const k of keys) {
      const nv = vt[k];
      if (typeof nv === "string" && nv.trim()) return nv.trim();
    }
    return "";
  };

  const appid = envOrFlat("VOLC_TTS_APPID") || nested("appid");
  const token = envOrFlat("VOLC_TTS_ACCESS_TOKEN") || nested("access_token", "accessToken");
  const apiKey = envOrFlat("VOLC_TTS_API_KEY") || nested("api_key", "apiKey");
  const voice = envOrFlat("VOLC_TTS_VOICE_TYPE") || nested("voice_type") || DEFAULT_VOICE;
  const encoding = envOrFlat("VOLC_TTS_ENCODING") || nested("encoding") || "mp3";
  const resourceId = envOrFlat("VOLC_TTS_RESOURCE_ID") || nested("resource_id", "resourceId") || DEFAULT_RESOURCE_ID;

  if (!apiKey && (!appid || !token)) {
    throw new Error(
      "未找到火山 TTS 凭证。请在项目根目录的 settings.json 或环境变量中设置:\n" +
        "  新版: VOLC_TTS_API_KEY\n" +
        "  旧版: VOLC_TTS_APPID, VOLC_TTS_ACCESS_TOKEN\n" +
        "可选: VOLC_TTS_VOICE_TYPE, VOLC_TTS_ENCODING, VOLC_TTS_RESOURCE_ID"
    );
  }

  return { appid: appid || "", token: token || "", apiKey, voice, encoding, resourceId };
}

// ── SFX pre-mix ──────────────────────────────────────────────────────
// If a user drops sound-effect files into public/sfx/<chapter>/<step>.wav
// (or .mp3), this helper concatenates the SFX before the TTS audio so the
// final mp3 already contains the effect. wvp-render then outputs a video
// whose audio track includes both narration and effects — no post-mix needed.
// ----------------------------------------------------------------------

const SFX_DIR = resolve(ROOT, "public/sfx");

function findSfx(chapter: string, step: number): string | null {
  for (const ext of [".wav", ".mp3", ".m4a"]) {
    const p = resolve(SFX_DIR, chapter, `${step}${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

function ffmpegConcat(first: string, second: string, out: string): boolean {
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", first,
      "-i", second,
      "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[outa]",
      "-map", "[outa]",
      "-c:a", "libmp3lame",
      "-b:a", "192k",
      out,
    ],
    { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return r.status === 0;
}

async function main(): Promise<void> {
  // Parse args
  const args = process.argv.slice(2);
  const FORCE = args.includes("--force");
  const voiceArg = args.find((a) => a.startsWith("--voice="))?.slice("--voice=".length) || "";

  if (!existsSync(SEGMENTS)) {
    console.error(`✗ ${SEGMENTS} not found. Run: npm run extract-narrations`);
    process.exit(1);
  }

  const segments: Segment[] = JSON.parse(readFileSync(SEGMENTS, "utf-8")) as Segment[];
  if (!Array.isArray(segments) || segments.length === 0) {
    console.error("✗ audio-segments.json 为空或格式错误");
    process.exit(1);
  }

  const creds = getCredentials();
  const voice = voiceArg || creds.voice;

  let synthesized = 0;
  let skipped = 0;
  let failed = 0;
  let sfxMixed = 0;
  const total = segments.length;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const out = resolve(OUT_DIR, seg.audio);
    const label = `${seg.chapter}/${seg.step}.mp3`;

    if (existsSync(out) && !FORCE) {
      skipped++;
      console.log(`[${String(i + 1).padStart(3)}/${total}] ${label.padEnd(20)} skip (exists)`);
      continue;
    }

    mkdirSync(dirname(out), { recursive: true });
    const start = Date.now();

    try {
      const audio = await ttsChunk({ ...creds, voice }, seg.text);

      // Check for matching SFX and pre-mix if found
      const sfxPath = findSfx(seg.chapter, seg.step);
      if (sfxPath) {
        const tmpTts = out + ".tmp-tts.mp3";
        const tmpOut = out + ".tmp-mixed.mp3";
        writeFileSync(tmpTts, audio);
        const ok = ffmpegConcat(sfxPath, tmpTts, tmpOut);
        unlinkSync(tmpTts);
        if (ok) {
          writeFileSync(out, readFileSync(tmpOut));
          unlinkSync(tmpOut);
          sfxMixed++;
        } else {
          // fallback: write plain TTS audio
          writeFileSync(out, audio);
        }
      } else {
        writeFileSync(out, audio);
      }

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      synthesized++;
      const sfxTag = sfxPath ? " [sfx]" : "";
      console.log(`[${String(i + 1).padStart(3)}/${total}] ${label.padEnd(20)} ✓ ${elapsed}s${sfxTag}`);
    } catch (e) {
      failed++;
      const msg = String(e instanceof Error ? e.message : e);
      console.error(`[${String(i + 1).padStart(3)}/${total}] ${label.padEnd(20)} ✗ FAILED: ${msg}`);
    }
  }

  console.log();
  console.log(`✓ done — synthesized ${synthesized}, skipped ${skipped}, failed ${failed}`);
  if (sfxMixed > 0) console.log(`        + ${sfxMixed} segments pre-mixed with SFX`);
  if (failed > 0) process.exit(2);
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
});
