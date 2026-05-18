import "./Coldopen.css";

interface Props {
  step: number;
}

export default function Coldopen({ step }: Props) {
  return (
    <div className="co-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
    </div>
  );
}

/* ── Step 0: 上条视频数据卡片 + 评论区占位 ── */
function Step0() {
  return (
    <div className="co-step0">
      <span className="bg-shape-coral" />
      <span className="bg-stripe-band-r" />

      <main className="co-main">
        {/* 数据票根卡 */}
        <div className="card-stamp co-data-card">
          <span className="stripe-corner" />
          <span className="chip-ink">PREVIOUS VIDEO</span>

          <div className="co-hero-row">
            <div className="co-hero-item">
              <span className="co-hero-num">4.0<span className="co-hero-unit">k+</span></span>
              <span className="co-hero-label">播放</span>
            </div>
            <div className="co-hero-divider" />
            <div className="co-hero-item">
              <span className="co-hero-num">500</span>
              <span className="co-hero-label">收藏</span>
            </div>
            <div className="co-hero-divider" />
            <div className="co-hero-item">
              <span className="co-hero-num">12.5<span className="co-hero-unit">%</span></span>
              <span className="co-hero-label">收藏率</span>
            </div>
          </div>

          <p className="co-sub">技术区头部水准</p>
        </div>

        {/* 评论区图片 */}
        <div className="co-comment-wrap tilt-r">
          <img src="/hook.png" alt="comment" className="co-comment-img" />
        </div>

        {/* GitHub 入口 */}
        <div className="co-gh-row">
          <span className="chip-mint">GITHUB</span>
          <span className="co-gh-text">baichen99/next-docs-rag · 代码开源 · 可复现</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 1: 黑底大字钩子 ── */
function Step1() {
  return (
    <div className="co-step1">
      <div className="co-ink-bg" />

      <main className="co-main-center">
        <span className="chip-accent co-top-chip">CONTINUED</span>

        <h1 className="co-hook-title">
          <span className="co-line1">5 个问题</span>
          <span className="co-line-dot">·</span>
          <span className="co-line2">1 个翻车</span>
        </h1>

        <p className="co-hook-sub">
          工业级 RAG 长啥样
        </p>

        <div className="co-arrow-hint">
          <span className="co-arrow" />
        </div>
      </main>
    </div>
  );
}
