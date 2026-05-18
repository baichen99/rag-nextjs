import { X, Check, Zap, BarChart3, Timer, Target, Lightbulb } from "lucide-react";
import "./Q3Rerank.css";

interface Props {
  step: number;
}

export default function Q3Rerank({ step }: Props) {
  return (
    <div className="q3-scene">
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
    <div className="q3-step0">
      <span className="bg-shape-coral" />
      <main className="q3-main">
        <div className="q3-vs-row">
          <div className="card-stamp q3-wrong-card">
            <span className="stripe-corner" />
            <span className="chip-ink q3-wrong-tag">WRONG</span>
            <X className="q3-wrong-icon" size={48} />
            <span className="q3-wrong-text">换个更好的 LLM</span>
          </div>

          <span className="q3-vs-arrow">→</span>

          <div className="card-stamp-accent q3-right-card">
            <span className="stripe-corner" />
            <span className="chip-mint q3-right-tag">RIGHT</span>
            <Check className="q3-right-icon" size={48} />
            <span className="q3-right-text">加 Reranker</span>
          </div>
        </div>
        <span className="q3-vs-sub">top 20 → 精排 → top 5</span>
      </main>
    </div>
  );
}

/* ── Step 1: Bi-encoder vs Cross-encoder ── */
function Step1() {
  return (
    <div className="q3-step1">
      <span className="bg-stripe-band-l" />
      <main className="q3-main">
        <div className="q3-encoder-row">
          {/* Bi-encoder */}
          <div className="card-stamp q3-enc-card">
            <span className="stripe-corner" />
            <span className="chip-ink">BI-ENCODER</span>
            <div className="q3-enc-diagram">
              <div className="q3-enc-box">
                <span className="q3-enc-label">Query</span>
              </div>
              <span className="q3-enc-plus">+</span>
              <div className="q3-enc-box">
                <span className="q3-enc-label">Doc</span>
              </div>
              <span className="q3-enc-eq">→</span>
              <div className="q3-enc-vec">
                <span className="q3-enc-vlabel">分开编码</span>
              </div>
            </div>
            <div className="q3-enc-props">
              <span className="q3-prop q3-prop-fast"><Zap size={14} /> 速度快</span>
              <span className="q3-prop q3-prop-rough"><BarChart3 size={14} /> 精度粗</span>
            </div>
          </div>

          <span className="q3-enc-vs">vs</span>

          {/* Cross-encoder */}
          <div className="card-stamp-mint q3-enc-card">
            <span className="stripe-corner-mint" />
            <span className="chip-accent">CROSS-ENCODER</span>
            <div className="q3-enc-diagram q3-cross-dia">
              <div className="q3-cross-box">
                <span className="q3-enc-label">Query + Doc</span>
              </div>
              <span className="q3-enc-eq">→</span>
              <div className="q3-enc-vec q3-cross-vec">
                <span className="q3-enc-vlabel">一起编码</span>
              </div>
            </div>
            <div className="q3-enc-props">
              <span className="q3-prop q3-prop-slow"><Timer size={14} /> 速度慢</span>
              <span className="q3-prop q3-prop-accurate"><Target size={14} /> 精度高</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: v0.2→v0.3 对比 ── */
function Step2() {
  return (
    <div className="q3-step2">
      <span className="bg-shape-mint" />
      <main className="q3-main">
        <span className="chip-accent q3-step-label">v0.2 → v0.3</span>

        <div className="q3-metrics-row">
          <div className="card-stamp q3-metric-card">
            <span className="q3-metric-name">Recall@5</span>
            <div className="q3-metric-change">
              <span className="q3-metric-old">50.0%</span>
              <span className="q3-metric-arrow">→</span>
              <span className="q3-metric-new q3-metric-up">56.7%</span>
            </div>
            <span className="chip-mint q3-metric-badge">+6.7%</span>
          </div>

          <div className="card-stamp q3-metric-card">
            <span className="q3-metric-name">Answer Acc</span>
            <div className="q3-metric-change">
              <span className="q3-metric-old">73.3%</span>
              <span className="q3-metric-arrow">→</span>
              <span className="q3-metric-new">73.3%</span>
            </div>
            <span className="chip-ink q3-metric-badge">0%</span>
          </div>
        </div>

        <div className="q3-insight">
          <Lightbulb className="q3-insight-icon" size={24} />
          <span className="q3-insight-text">Recall 涨，Acc 平 → Reranker 解决「排序」不是「答案」</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 3: VIZ-04 漏斗动画 ── */
function Step3() {
  const top20 = Array.from({ length: 20 }, (_, i) => i);
  const top5Indices = [0, 3, 7, 12, 15]; // Which ones make it to top 5

  return (
    <div className="q3-step3">
      <span className="bg-shape-coral" />
      <main className="q3-main-funnel">
        <span className="chip-accent q3-funnel-label">VIZ-04 · RERANK FUNNEL</span>

        <div className="q3-funnel">
          {/* Top 20 */}
          <div className="q3-funnel-stage">
            <span className="q3-funnel-title">Top 20 retrieved</span>
            <div className="q3-funnel-grid">
              {top20.map((i) => (
                <div
                  key={i}
                  className={`q3-funnel-block ${top5Indices.includes(i) ? "q3-funnel-selected" : ""}`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                />
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="q3-funnel-arrow">
            <span className="q3-funnel-arrow-line" />
            <span className="q3-funnel-arrow-head">▶</span>
            <span className="chip-mint q3-funnel-action">RERANK</span>
          </div>

          {/* Top 5 */}
          <div className="q3-funnel-stage">
            <span className="q3-funnel-title">Top 5 reranked</span>
            <div className="q3-funnel-stack">
              {top5Indices.map((_, i) => (
                <div
                  key={i}
                  className="q3-funnel-bar"
                  style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                >
                  <span className="q3-funnel-bar-num">{i + 1}</span>
                  <span className="q3-funnel-bar-score">score: {((5 - i) * 0.15 + 0.7).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 4: dashscope.ts 代码 ── */
function Step4() {
  return (
    <div className="q3-step4">
      <span className="bg-shape-ink" />
      <main className="q3-main-code">
        <span className="chip-accent q3-code-label">20 LINES · src/reranking/dashscope.ts</span>

        <div className="card-stamp-ink q3-code-card">
          <span className="stripe-corner" />
          <div className="q3-code-block">
            <div className="q3-code-line">
              <span className="tk-k">export async function</span>
              <span className="tk-f"> rerank</span>
              <span className="tk-p">(</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-v">query</span>
              <span className="tk-p">: string,</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-v">docs</span>
              <span className="tk-p">: RerankInput[],</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-v">topN</span>
              <span className="tk-k"> = </span>
              <span className="tk-n">5</span>
            </div>
            <div className="q3-code-line">
              <span className="tk-p">): Promise&lt;RerankResult[]&gt; {"{"}</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-k">const</span>
              <span className="tk-v"> response </span>
              <span className="tk-o">=</span>
              <span className="tk-k"> await</span>
              <span className="tk-f"> fetch</span>
              <span className="tk-p">(</span>
            </div>
            <div className="q3-code-line q3-code-indent2">
              <span className="tk-s">&apos;https://dashscope.aliyuncs.com/.../text-rerank&apos;</span>
              <span className="tk-p">, {"{"}</span>
            </div>
            <div className="q3-code-line q3-code-indent2">
              <span className="tk-v">method</span>
              <span className="tk-p">: </span>
              <span className="tk-s">&apos;POST&apos;</span>
              <span className="tk-p">,</span>
            </div>
            <div className="q3-code-line q3-code-indent2">
              <span className="tk-v">body</span>
              <span className="tk-p">: JSON.</span>
              <span className="tk-f">stringify</span>
              <span className="tk-p">({"{"}</span>
            </div>
            <div className="q3-code-line q3-code-indent3">
              <span className="tk-v">model</span>
              <span className="tk-p">: </span>
              <span className="tk-s">&apos;gte-rerank&apos;</span>
              <span className="tk-p">,</span>
            </div>
            <div className="q3-code-line q3-code-indent3">
              <span className="tk-v">input</span>
              <span className="tk-p">: {"{"} query, documents: ... {"}"},</span>
            </div>
            <div className="q3-code-line q3-code-indent3">
              <span className="tk-v">parameters</span>
              <span className="tk-p">: {"{"} top_n: topN {"}"}</span>
            </div>
            <div className="q3-code-line q3-code-indent2">
              <span className="tk-p">{"}"})</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-p">{"}"})</span>
            </div>
            <div className="q3-code-line q3-code-indent">
              <span className="tk-k">return</span>
              <span className="tk-v"> data</span>
              <span className="tk-p">.output.results.</span>
              <span className="tk-f">map</span>
              <span className="tk-p">(r =&gt; ({"{"} ...docs[r.index], </span>
              <span className="tk-v">rerankScore</span>
              <span className="tk-p">: r.relevance_score {"}"}))</span>
            </div>
            <div className="q3-code-line">
              <span className="tk-p">{"}"}</span>
            </div>
          </div>
        </div>

        <div className="q3-provider-badge">
          <span className="chip-mint">阿里百炼</span>
          <span className="q3-provider-text">DashScope · gte-rerank · 国内直接可用</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 5: e01 案例 ── */
function Step5() {
  return (
    <div className="q3-step5">
      <span className="bg-shape-mint" />
      <main className="q3-main">
        <span className="chip-accent q3-case-label">CASE · e01</span>

        <div className="q3-case-card card-stamp">
          <span className="stripe-corner" />
          <span className="q3-case-q">How do you do server-side data fetching in Next.js?</span>

          <div className="q3-case-compare">
            <div className="q3-case-before">
              <span className="chip-ink">BASELINE</span>
              <span className="q3-case-ans">getServerSideProps</span>
              <span className="q3-case-note"><X size={14} /> 召回 Pages Router 文档</span>
            </div>

            <span className="q3-case-vs">→</span>

            <div className="q3-case-after">
              <span className="chip-mint">+ RERANK</span>
              <span className="q3-case-ans">async fetch in Server Component</span>
              <span className="q3-case-note"><Check size={14} /> App Router 文档排到前面</span>
            </div>
          </div>
        </div>

        <div className="q3-case-value">
          <span className="q3-value-text">Reranker 的价值：把「语义相近但主题不同」的文档压下去</span>
        </div>
      </main>
    </div>
  );
}
