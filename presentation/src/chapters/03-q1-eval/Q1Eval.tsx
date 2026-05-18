import { SlidersHorizontal, TrendingDown } from "lucide-react";
import "./Q1Eval.css";

interface Props {
  step: number;
}

export default function Q1Eval({ step }: Props) {
  return (
    <div className="q1-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
}

/* ── Step 0: 老板问话气泡 ── */
function Step0() {
  return (
    <div className="q1-step0">
      <span className="bg-shape-coral" />
      <main className="q1-main">
        <div className="q1-bubble q1-bubble-boss">
          <span className="q1-bubble-text">你的 RAG 准不准？</span>
        </div>
        <div className="q1-bubble q1-bubble-you">
          <span className="q1-bubble-text q1-bubble-mute">???</span>
        </div>
        <span className="chip-ink q1-step0-label">BOSS ASKING</span>
      </main>
    </div>
  );
}

/* ── Step 1: 90% 没评估 ── */
function Step1() {
  return (
    <div className="q1-step1">
      <span className="bg-shape-ink" />
      <main className="q1-main">
        <div className="q1-big-num-wrap">
          <span className="q1-big-num">90<span className="q1-big-pct">%</span></span>
          <span className="q1-big-label">的 RAG 项目没评估</span>
        </div>
        <div className="q1-sub-cards">
          <div className="q1-sub-card">
            <SlidersHorizontal className="q1-sub-icon" size={28} />
            <span className="q1-sub-text">凭感觉调参</span>
          </div>
          <div className="q1-sub-card">
            <TrendingDown className="q1-sub-icon" size={28} />
            <span className="q1-sub-text">调了一年不知道好坏</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: 评估集 4 类结构 ── */
function Step2() {
  const categories = [
    { id: "factual", name: "事实型", count: 8, color: "var(--accent-2)", desc: "基础概念题" },
    { id: "troubleshooting", name: "故障型", count: 7, color: "var(--danger)", desc: "报错关键词" },
    { id: "cross-doc", name: "跨文档", count: 8, color: "var(--accent)", desc: "需完整章节" },
    { id: "evolution", name: "演化型", count: 7, color: "var(--accent-3)", desc: "App vs Pages" },
  ];

  return (
    <div className="q1-step2">
      <span className="bg-stripe-band-l" />
      <main className="q1-main-grid">
        <span className="chip-accent q1-grid-label">EVAL DATASET · 30 QUESTIONS</span>
        <div className="q1-cat-grid">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="card-stamp q1-cat-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="q1-cat-bar" style={{ background: c.color }} />
              <span className="q1-cat-count">{c.count}</span>
              <span className="q1-cat-name">{c.name}</span>
              <span className="q1-cat-desc">{c.desc}</span>
            </div>
          ))}
        </div>
        <div className="q1-code-hint">
          <span className="chip-ink">src/eval/dataset.ts</span>
          <span className="q1-hint-text">4 类问题 · 每类 expectedSources + expectedKeywords</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 3: metrics.ts 代码高亮 ── */
function Step3() {
  return (
    <div className="q1-step3">
      <span className="bg-shape-mint" />
      <main className="q1-main-code">
        <span className="chip-accent q1-code-label">METRICS · src/eval/metrics.ts</span>

        <div className="q1-code-wrap">
          <div className="card-stamp-ink q1-code-card">
            <span className="stripe-corner" />
            {/* computeRecallAt5 */}
            <div className="q1-code-block">
              <div className="q1-code-fn">
                <span className="tk-k">export function</span>{" "}
                <span className="tk-f">computeRecallAt5</span>
                <span className="tk-p">(</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-v">result</span>
                <span className="tk-p">: PipelineResult,</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-v">question</span>
                <span className="tk-p">: EvalQuestion</span>
              </div>
              <div className="q1-code-line">
                <span className="tk-p">):</span>{" "}
                <span className="tk-t">number</span>{" "}
                <span className="tk-p">{"{"}</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-k">const</span>{" "}
                <span className="tk-v">sources</span>{" "}
                <span className="tk-o">=</span>{" "}
                <span className="tk-v">result</span>
                <span className="tk-p">.</span>
                <span className="tk-f">retrievedChunks</span>
                <span className="tk-p">.</span>
                <span className="tk-f">map</span>
                <span className="tk-p">(c =&gt; c.source);</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="q1-code-comment">// 命中其中一个 source 就算 recall 成功</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-k">return</span>{" "}
                <span className="tk-v">hit</span>{" "}
                <span className="tk-o">/</span>{" "}
                <span className="tk-v">expected</span>
                <span className="tk-p">.</span>
                <span className="tk-f">length</span>
                <span className="tk-p">;</span>
              </div>
              <div className="q1-code-line">
                <span className="tk-p">{"}"}</span>
              </div>
            </div>

            <div className="q1-code-divider" />

            {/* computeAnswerAccuracy */}
            <div className="q1-code-block">
              <div className="q1-code-fn">
                <span className="tk-k">export function</span>{" "}
                <span className="tk-f">computeAnswerAccuracy</span>
                <span className="tk-p">(</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-v">result</span>
                <span className="tk-p">: PipelineResult,</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-v">question</span>
                <span className="tk-p">: EvalQuestion</span>
              </div>
              <div className="q1-code-line">
                <span className="tk-p">):</span>{" "}
                <span className="tk-t">number</span>{" "}
                <span className="tk-p">{"{"}</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-k">const</span>{" "}
                <span className="tk-v">answer</span>{" "}
                <span className="tk-o">=</span>{" "}
                <span className="tk-v">result</span>
                <span className="tk-p">.</span>
                <span className="tk-f">answer</span>
                <span className="tk-p">.</span>
                <span className="tk-f">toLowerCase</span>
                <span className="tk-p">();</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-k">const</span>{" "}
                <span className="tk-v">hit</span>{" "}
                <span className="tk-o">=</span>{" "}
                <span className="tk-v">keywords</span>
                <span className="tk-p">.</span>
                <span className="tk-f">filter</span>
                <span className="tk-p">(k =&gt; answer.</span>
                <span className="tk-f">includes</span>
                <span className="tk-p">(k)).</span>
                <span className="tk-f">length</span>
                <span className="tk-p">;</span>
              </div>
              <div className="q1-code-line q1-code-indent">
                <span className="tk-k">return</span>{" "}
                <span className="tk-v">hit</span>{" "}
                <span className="tk-o">&gt;=</span>{" "}
                <span className="tk-v">keywords</span>
                <span className="tk-p">.</span>
                <span className="tk-f">length</span>{" "}
                <span className="tk-o">*</span>{" "}
                <span className="tk-n">0.5</span>{" "}
                <span className="tk-o">?</span>{" "}
                <span className="tk-n">1</span>{" "}
                <span className="tk-o">:</span>{" "}
                <span className="tk-n">0</span>
                <span className="tk-p">;</span>
              </div>
              <div className="q1-code-line">
                <span className="tk-p">{"}"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="q1-metric-legend">
          <div className="q1-legend-item">
            <span className="q1-legend-dot" style={{ background: "var(--accent)" }} />
            <span className="q1-legend-text">Recall@5 — 检索环节</span>
          </div>
          <div className="q1-legend-item">
            <span className="q1-legend-dot" style={{ background: "var(--accent-2)" }} />
            <span className="q1-legend-text">Answer Accuracy — 生成环节</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 4: v0.1 数据对比卡 ── */
function Step4() {
  const breakdown = [
    { cat: "整体", recall: "48.3%", acc: "63.3%", highlight: false },
    { cat: "factual", recall: "50.0%", acc: "62.5%", highlight: false },
    { cat: "troubleshooting", recall: "28.6%", acc: "85.7%", highlight: true },
    { cat: "cross-doc", recall: "81.3%", acc: "50.0%", highlight: false },
    { cat: "evolution", recall: "28.6%", acc: "57.1%", highlight: false },
  ];

  return (
    <div className="q1-step4">
      <span className="bg-shape-coral" />
      <main className="q1-main-data">
        <span className="chip-ink q1-data-label">v0.1 BASELINE RESULTS</span>

        <div className="card-stamp q1-data-card">
          <span className="stripe-corner" />
          <table className="q1-data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Recall@5</th>
                <th>Answer Acc</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => (
                <tr key={row.cat} className={row.highlight ? "q1-row-highlight" : ""}>
                  <td>
                    <span className="q1-cat-tag">{row.cat}</span>
                  </td>
                  <td>
                    <span className={`q1-data-num ${row.highlight ? "q1-num-danger" : ""}`}>
                      {row.recall}
                    </span>
                  </td>
                  <td>
                    <span className="q1-data-num">{row.acc}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="q1-data-anno">
            <span className="chip-accent">ATTENTION</span>
            <span className="q1-anno-text">troubleshooting recall 仅 28.6% — 整体数字会骗你</span>
          </div>
        </div>
      </main>
    </div>
  );
}
