import { X, Check, Pencil, Package } from "lucide-react";
import "./Q2Hybrid.css";

interface Props {
  step: number;
}

export default function Q2Hybrid({ step }: Props) {
  return (
    <div className="q2-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
    </div>
  );
}

/* ── Step 0: 错误答案 → 正确答案 ── */
function Step0() {
  return (
    <div className="q2-step0">
      <span className="bg-shape-coral" />
      <main className="q2-main">
        <div className="q2-vs-row">
          <div className="card-stamp q2-wrong-card">
            <span className="stripe-corner" />
            <span className="chip-ink q2-wrong-tag">WRONG</span>
            <X className="q2-wrong-icon" size={48} />
            <span className="q2-wrong-text">再加文档</span>
          </div>

          <span className="q2-vs-arrow">→</span>

          <div className="card-stamp-mint q2-right-card">
            <span className="stripe-corner-mint" />
            <span className="chip-accent q2-right-tag">RIGHT</span>
            <Check className="q2-right-icon" size={48} />
            <span className="q2-right-text">Hybrid Search</span>
          </div>
        </div>
        <span className="q2-vs-sub">BM25 + Vector + RRF 融合</span>
      </main>
    </div>
  );
}

/* ── Step 1: BM25 vs Vector 并排 ── */
function Step1() {
  return (
    <div className="q2-step1">
      <span className="bg-stripe-band-r" />
      <main className="q2-main">
        <div className="q2-retriever-row">
          {/* BM25 */}
          <div className="card-stamp q2-ret-card">
            <span className="stripe-corner" />
            <span className="chip-ink">BM25</span>
            <div className="q2-ret-visual">
              <span className="q2-kw q2-kw-1">error</span>
              <span className="q2-kw q2-kw-2">hydration</span>
              <span className="q2-kw q2-kw-3">useState</span>
              <span className="q2-kw q2-kw-4">not found</span>
              <span className="q2-kw q2-kw-5">cookies</span>
            </div>
            <span className="q2-ret-desc">关键词匹配</span>
            <span className="q2-ret-sub">报错信息 = 杀手锏</span>
          </div>

          {/* VS */}
          <span className="q2-ret-vs">+</span>

          {/* Vector */}
          <div className="card-stamp q2-ret-card">
            <span className="stripe-corner" />
            <span className="chip-accent">VECTOR</span>
            <div className="q2-ret-visual q2-vector-vis">
              <div className="q2-vec-dot" />
              <div className="q2-vec-dot" />
              <div className="q2-vec-dot" />
              <div className="q2-vec-dot" />
              <div className="q2-vec-dot" />
              <div className="q2-vec-line" />
            </div>
            <span className="q2-ret-desc">语义匹配</span>
            <span className="q2-ret-sub">同义词、改写 = 强项</span>
          </div>
        </div>

        <div className="q2-fusion-badge">
          <span className="chip-mint">RRF 融合 · weights [0.6, 0.4]</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: 整体数据对比（变化极小） ── */
function Step2() {
  return (
    <div className="q2-step2">
      <span className="bg-shape-mint" />
      <main className="q2-main">
        <span className="chip-ink q2-step-label">OVERALL METRICS</span>

        <div className="q2-compare-row">
          <div className="card-stamp q2-compare-card">
            <span className="q2-version-tag">v0.1</span>
            <span className="q2-compare-num">48.3<span className="q2-compare-pct">%</span></span>
            <span className="q2-compare-label">Recall@5</span>
          </div>

          <div className="q2-change-arrow">
            <span className="q2-change-num">+1.7%</span>
            <span className="q2-change-arrow-icon">→</span>
          </div>

          <div className="card-stamp q2-compare-card">
            <span className="q2-version-tag">v0.2</span>
            <span className="q2-compare-num">50.0<span className="q2-compare-pct">%</span></span>
            <span className="q2-compare-label">Recall@5</span>
          </div>
        </div>

        <div className="q2-suspense-text">
          <span className="q2-suspense-mark">?</span>
          <span>看起来几乎没变化？</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 3: 分类别柱状图 ── */
function Step3() {
  const categories = [
    { name: "factual", v1: 50.0, v2: 50.0, acc1: 62.5, acc2: 87.5 },
    { name: "troubleshooting", v1: 28.6, v2: 42.9, acc1: 85.7, acc2: 100, wow: true },
    { name: "cross-doc", v1: 81.3, v2: 75.0, acc1: 50.0, acc2: 25.0 },
    { name: "evolution", v1: 28.6, v2: 28.6, acc1: 57.1, acc2: 85.7 },
  ];

  const barH = 160;
  const barW = 48;

  return (
    <div className="q2-step3">
      <span className="bg-shape-coral" />
      <main className="q2-main-chart">
        <span className="chip-accent q2-chart-label">CATEGORY BREAKDOWN</span>

        <div className="q2-bar-chart">
          {categories.map((c, i) => (
            <div key={c.name} className="q2-bar-group" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="q2-bar-pair">
                {/* v0.1 bar */}
                <div className="q2-bar-wrap">
                  <div
                    className="q2-bar q2-bar-v1"
                    style={{ height: `${(c.v1 / 100) * barH}px`, width: barW }}
                  />
                  <span className="q2-bar-val">{c.v1}%</span>
                </div>
                {/* v0.2 bar */}
                <div className="q2-bar-wrap">
                  <div
                    className={`q2-bar q2-bar-v2 ${c.wow ? "q2-bar-wow" : ""}`}
                    style={{ height: `${(c.v2 / 100) * barH}px`, width: barW }}
                  />
                  <span className="q2-bar-val">{c.v2}%</span>
                </div>
              </div>
              <span className={`q2-bar-label ${c.wow ? "q2-bar-label-wow" : ""}`}>{c.name}</span>
              {c.wow && <span className="q2-bar-wow-badge">WOW</span>}
            </div>
          ))}
        </div>

        <div className="q2-chart-legend">
          <div className="q2-legend-item">
            <span className="q2-legend-bar" style={{ background: "var(--text-mute)" }} />
            <span>v0.1 Recall</span>
          </div>
          <div className="q2-legend-item">
            <span className="q2-legend-bar" style={{ background: "var(--accent-2)" }} />
            <span>v0.2 Recall</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 4: hybrid.ts 代码高亮 ── */
function Step4() {
  return (
    <div className="q2-step4">
      <span className="bg-shape-ink" />
      <main className="q2-main-code">
        <span className="chip-accent q2-code-label">STORY · src/retrieval/hybrid.ts</span>

        <div className="card-stamp-ink q2-code-card">
          <span className="stripe-corner" />
          <div className="q2-code-block">
            <div className="q2-code-line">
              <span className="tk-k">import</span>
              <span className="tk-p">{" "}</span>
              <span className="tk-p">{"{"}</span>
              <span className="tk-v"> BM25Retriever </span>
              <span className="tk-p">{"}"}</span>
              <span className="tk-k"> from </span>
              <span className="tk-s">&apos;@langchain/community/retrievers/bm25&apos;</span>
              <span className="tk-p">;</span>
            </div>
            <div className="q2-code-line q2-code-highlight">
              <span className="tk-k">import</span>
              <span className="tk-p">{" "}</span>
              <span className="tk-p">{"{"}</span>
              <span className="tk-v"> EnsembleRetriever </span>
              <span className="tk-p">{"}"}</span>
              <span className="tk-k"> from </span>
              <span className="tk-s">&apos;@langchain/classic/retrievers/ensemble&apos;</span>
              <span className="tk-p">;</span>
            </div>
            <div className="q2-code-line">
              <span className="tk-k">import</span>
              <span className="tk-p">{" "}</span>
              <span className="tk-p">{"{"}</span>
              <span className="tk-v"> Document </span>
              <span className="tk-p">{"}"}</span>
              <span className="tk-k"> from </span>
              <span className="tk-s">&apos;@langchain/core/documents&apos;</span>
              <span className="tk-p">;</span>
            </div>
            <div className="q2-code-line" />
            <div className="q2-code-line">
              <span className="tk-k">return new</span>
              <span className="tk-f"> EnsembleRetriever</span>
              <span className="tk-p">({"{"}</span>
            </div>
            <div className="q2-code-line q2-code-indent">
              <span className="tk-v">retrievers</span>
              <span className="tk-p">: [vectorRetriever, bm25Retriever],</span>
            </div>
            <div className="q2-code-line q2-code-indent">
              <span className="tk-v">weights</span>
              <span className="tk-p">: [</span>
              <span className="tk-n">0.6</span>
              <span className="tk-p">, </span>
              <span className="tk-n">0.4</span>
              <span className="tk-p">],</span>
            </div>
            <div className="q2-code-line">
              <span className="tk-p">{"}"});</span>
            </div>
          </div>
        </div>

        <div className="q2-story-note">
          <span className="chip-mint">STORY</span>
          <span className="q2-note-text">LangChain.js 重构后，EnsembleRetriever 搬到了 @langchain/classic</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 5: 手写 RRF vs 官方 + 金句 ── */
function Step5() {
  return (
    <div className="q2-step5">
      <span className="bg-shape-mint" />
      <main className="q2-main">
        <div className="q2-compare-cards">
          <div className="card-stamp q2-hand-card">
            <span className="stripe-corner" />
            <span className="chip-ink">HANDWRITTEN</span>
            <Pencil className="q2-hand-icon" size={40} />
            <span className="q2-hand-title">手写 RRF</span>
            <ul className="q2-hand-list">
              <li>自己实现融合公式</li>
              <li>权重硬编码</li>
              <li>维护成本高</li>
            </ul>
          </div>

          <div className="q2-vs-or">vs</div>

          <div className="card-stamp-mint q2-official-card">
            <span className="stripe-corner-mint" />
            <span className="chip-accent">OFFICIAL</span>
            <Package className="q2-off-icon" size={40} />
            <span className="q2-off-title">EnsembleRetriever</span>
            <ul className="q2-off-list">
              <li>@langchain/classic 官方</li>
              <li>配置化 weights</li>
              <li>社区维护</li>
            </ul>
          </div>
        </div>

        <div className="q2-quote-card">
          <span className="q2-quote-mark">&ldquo;</span>
          <p className="q2-quote-text">
            主流包变了你能不能找到新位置，这本身就是工程素养。
          </p>
        </div>
      </main>
    </div>
  );
}
