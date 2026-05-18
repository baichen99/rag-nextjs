import { X, BookOpen, TrendingDown, ArrowRight, GitBranch, AlertTriangle, Check, History } from "lucide-react";
import "./Q5Rewrite.css";

interface Props {
  step: number;
}

export default function Q5Rewrite({ step }: Props) {
  return (
    <div className="q5-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <Step6 />}
      {step === 7 && <Step7 />}
    </div>
  );
}

/* ── Step 0: 错误答案 → 教科书答案 ── */
function Step0() {
  return (
    <div className="q5-step0">
      <span className="bg-shape-coral" />
      <main className="q5-main">
        <div className="q5-vs-row">
          <div className="card-stamp q5-wrong-card">
            <span className="stripe-corner" />
            <span className="chip-ink q5-wrong-tag">WRONG</span>
            <X className="q5-wrong-icon" size={48} />
            <span className="q5-wrong-text">加上对话历史就行</span>
          </div>

          <span className="q5-vs-arrow">→</span>

          <div className="card-stamp-mint q5-textbook-card">
            <span className="stripe-corner-mint" />
            <span className="chip-accent q5-textbook-tag">TEXTBOOK</span>
            <BookOpen className="q5-textbook-icon" size={48} />
            <span className="q5-textbook-text">Multi-Query + History</span>
          </div>
        </div>
        <span className="q5-vs-sub">教科书答案，我们照做了</span>
      </main>
    </div>
  );
}

/* ── Step 1: v0.4→v0.5 全面回退 ── */
function Step1() {
  return (
    <div className="q5-step1">
      <span className="bg-shape-ink" />
      <main className="q5-main">
        <span className="chip-ink q5-step-label">v0.4 → v0.5 · CRASH</span>

        <div className="q5-crash-row">
          <div className="card-stamp q5-crash-card">
            <span className="stripe-corner" />
            <span className="q5-crash-name">Recall@5</span>
            <div className="q5-crash-change">
              <span className="q5-crash-old">50.0%</span>
              <TrendingDown className="q5-crash-arrow-icon" size={24} />
              <span className="q5-crash-new">40.0%</span>
            </div>
            <span className="chip-ink q5-crash-badge">-10%</span>
          </div>

          <div className="card-stamp q5-crash-card">
            <span className="stripe-corner" />
            <span className="q5-crash-name">Answer Acc</span>
            <div className="q5-crash-change">
              <span className="q5-crash-old">80.0%</span>
              <TrendingDown className="q5-crash-arrow-icon" size={24} />
              <span className="q5-crash-new">60.0%</span>
            </div>
            <span className="chip-ink q5-crash-badge">-20%</span>
          </div>
        </div>

        <div className="q5-crash-alert">
          <AlertTriangle className="q5-alert-icon" size={28} />
          <span className="q5-alert-text">全面回退，教科书答案挂了</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: 改写流程图 ── */
function Step2() {
  const flow = [
    { label: "原问题", sub: "精确具体", ok: true },
    { label: "x3 变体", sub: "语义漂移", ok: false },
    { label: "召回扩大", sub: "范围变宽", ok: false },
    { label: "噪声混入", sub: "精度下降", ok: false },
  ];

  return (
    <div className="q5-step2">
      <span className="bg-stripe-band-r" />
      <main className="q5-main">
        <span className="chip-accent q5-step-label">WHY IT CRASHED</span>

        <div className="q5-flow">
          {flow.map((f, i) => (
            <div key={i} className="q5-flow-item" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={`q5-flow-node ${f.ok ? "q5-flow-ok" : "q5-flow-bad"}`}>
                <span className="q5-flow-label">{f.label}</span>
                <span className="q5-flow-sub">{f.sub}</span>
              </div>
              {i < flow.length - 1 && (
                <ArrowRight className="q5-flow-arrow" size={20} />
              )}
            </div>
          ))}
        </div>

        <div className="q5-flow-insight">
          <GitBranch className="q5-flow-insight-icon" size={24} />
          <span className="q5-flow-insight-text">
            Multi-Query 把 1 个问题拆成 3 个，召回范围扩大，但噪声比例更高
          </span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 3: 代码 + 改写示例 ── */
function Step3() {
  return (
    <div className="q5-step3">
      <span className="bg-shape-ink" />
      <main className="q5-main-code">
        <span className="chip-accent q5-code-label">CODE · src/query-rewriting/multi-query.ts</span>

        <div className="q5-code-compare">
          <div className="card-stamp-ink q5-code-card">
            <span className="stripe-corner" />
            <div className="q5-code-block">
              <div className="q5-code-line">
                <span className="tk-k">export async function</span>
                <span className="tk-f"> rewriteToMultiQuery</span>
                <span className="tk-p">(question: string) {"{"}</span>
              </div>
              <div className="q5-code-line q5-code-indent">
                <span className="tk-k">const</span>
                <span className="tk-v"> prompt </span>
                <span className="tk-o">=</span>
                <span className="tk-s"> `把问题改写成 3 个不同表述...`</span>
              </div>
              <div className="q5-code-line q5-code-indent">
                <span className="tk-k">const</span>
                <span className="tk-v"> response </span>
                <span className="tk-o">=</span>
                <span className="tk-k"> await</span>
                <span className="tk-v"> llm</span>
                <span className="tk-p">.</span>
                <span className="tk-f">invoke</span>
                <span className="tk-p">(prompt);</span>
              </div>
              <div className="q5-code-line q5-code-indent">
                <span className="tk-k">return</span>
                <span className="tk-v"> JSON</span>
                <span className="tk-p">.</span>
                <span className="tk-f">parse</span>
                <span className="tk-p">(text);</span>
              </div>
              <div className="q5-code-line">
                <span className="tk-p">{"}"}</span>
              </div>
            </div>
          </div>

          <div className="q5-example-card card-stamp">
            <span className="stripe-corner" />
            <span className="chip-ink">EXAMPLE</span>
            <div className="q5-example-original">
              <span className="q5-example-label">Original</span>
              <span className="q5-example-text">
                App Router 默认是不是 Server Component?
              </span>
            </div>
            <div className="q5-example-rewrites">
              <span className="q5-example-label">Rewrites</span>
              <span className="q5-example-item">Next.js 15 默认渲染模式是什么</span>
              <span className="q5-example-item">Server Component 和 Client Component 区别</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 4: VIZ-03 分类别柱状图 ── */
function Step4() {
  const categories = [
    { name: "factual", recallV4: 62.5, recallV5: 37.5, accV4: 75.0, accV5: 50.0 },
    { name: "troubleshooting", recallV4: 42.9, recallV5: 28.6, accV4: 100, accV5: 85.7 },
    { name: "cross-doc", recallV4: 75.0, recallV5: 50.0, accV4: 25.0, accV5: 12.5 },
    { name: "evolution", recallV4: 28.6, recallV5: 0, accV4: 85.7, accV5: 0, crash: true },
  ];

  const barH = 140;
  const barW = 36;

  return (
    <div className="q5-step4">
      <span className="bg-shape-coral" />
      <main className="q5-main-chart">
        <span className="chip-accent q5-chart-label">VIZ-03 · CATEGORY BREAKDOWN</span>

        <div className="q5-bar-chart">
          {categories.map((c, i) => (
            <div key={c.name} className="q5-bar-group" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="q5-bar-pair">
                <div className="q5-bar-wrap">
                  <div
                    className="q5-bar q5-bar-v4"
                    style={{ height: `${(c.recallV4 / 100) * barH}px`, width: barW }}
                  />
                  <span className="q5-bar-val">{c.recallV4}%</span>
                </div>
                <div className="q5-bar-wrap">
                  <div
                    className={`q5-bar q5-bar-v5 ${c.crash ? "q5-bar-crash" : ""}`}
                    style={{ height: `${(c.recallV5 / 100) * barH}px`, width: barW }}
                  />
                  <span className="q5-bar-val">{c.recallV5}%</span>
                </div>
              </div>
              <span className={`q5-bar-label ${c.crash ? "q5-bar-label-crash" : ""}`}>{c.name}</span>
              {c.crash && <span className="q5-bar-crash-badge">CRASH</span>}
            </div>
          ))}
        </div>

        <div className="q5-chart-legend">
          <div className="q5-legend-item">
            <span className="q5-legend-bar" style={{ background: "var(--text-mute)" }} />
            <span>v0.4 Recall</span>
          </div>
          <div className="q5-legend-item">
            <span className="q5-legend-bar" style={{ background: "var(--danger)" }} />
            <span>v0.5 Recall</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 5: 场景区分表 ── */
function Step5() {
  const scenarios = [
    { name: "factual", label: "简单事实问题", multiQuery: false, history: false, note: "Multi-Query 引入噪声" },
    { name: "evolution", label: "演化/对比型", multiQuery: true, history: false, note: "多角度检索有帮助" },
    { name: "with-history", label: "有对话历史", multiQuery: false, history: true, note: "History Rewriting 足够" },
  ];

  return (
    <div className="q5-step5">
      <span className="bg-shape-mint" />
      <main className="q5-main">
        <span className="chip-accent q5-step-label">REAL ANSWER</span>

        <div className="q5-scenario-table">
          {scenarios.map((s, i) => (
            <div
              key={s.name}
              className="q5-scenario-row card-stamp"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="stripe-corner" />
              <div className="q5-scenario-info">
                <span className="q5-scenario-name">{s.label}</span>
                <span className="q5-scenario-note">{s.note}</span>
              </div>
              <div className="q5-scenario-checks">
                <span className={`q5-scenario-check ${s.multiQuery ? "q5-check-yes" : "q5-check-no"}`}>
                  {s.multiQuery ? <Check size={14} /> : <X size={14} />}
                  <span>Multi-Query</span>
                </span>
                <span className={`q5-scenario-check ${s.history ? "q5-check-yes" : "q5-check-no"}`}>
                  {s.history ? <Check size={14} /> : <X size={14} />}
                  <span>History</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Step 6: 黑底金句 ── */
function Step6() {
  return (
    <div className="q5-step6">
      <span className="q5-ink-bg" />
      <main className="q5-main-quote">
        <span className="chip-mint q5-quote-chip">REALITY CHECK</span>
        <div className="q5-quote">
          <span className="q5-quote-mark">&ldquo;</span>
          <p className="q5-quote-text">
            教科书答案在我数据集上挂了。
          </p>
          <p className="q5-quote-text q5-quote-line2">
            这就是工业级 RAG 跟教程的差距。
          </p>
        </div>
      </main>
    </div>
  );
}

/* ── Step 7: 黑底金句（第二遍）── */
function Step7() {
  return (
    <div className="q5-step7">
      <span className="q5-ink-bg" />
      <main className="q5-main-quote">
        <span className="chip-mint q5-quote-chip">REALITY CHECK</span>
        <div className="q5-quote">
          <span className="q5-quote-mark">&ldquo;</span>
          <p className="q5-quote-text">
            教科书答案在我数据集上挂了。
          </p>
          <p className="q5-quote-text q5-quote-line2">
            这就是工业级 RAG 跟教程的差距。
          </p>
        </div>
      </main>
    </div>
  );
}
