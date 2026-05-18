import { X, Check, FileText, Brain } from "lucide-react";
import "./Q4Chunking.css";

interface Props {
  step: number;
}

export default function Q4Chunking({ step }: Props) {
  return (
    <div className="q4-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
}

/* ── Step 0: 错误答案 → 正确答案 ── */
function Step0() {
  return (
    <div className="q4-step0">
      <span className="bg-shape-coral" />
      <main className="q4-main">
        <div className="q4-vs-row">
          <div className="card-stamp q4-wrong-card">
            <span className="stripe-corner" />
            <span className="chip-ink q4-wrong-tag">WRONG</span>
            <X className="q4-wrong-icon" size={48} />
            <span className="q4-wrong-text">chunk_size=1000</span>
          </div>

          <span className="q4-vs-arrow">→</span>

          <div className="card-stamp-mint q4-right-card">
            <span className="stripe-corner-mint" />
            <span className="chip-accent q4-right-tag">RIGHT</span>
            <Check className="q4-right-icon" size={48} />
            <span className="q4-right-text">Parent-Child</span>
          </div>
        </div>
        <span className="q4-vs-sub">Markdown-aware + Parent-Child Chunking</span>
      </main>
    </div>
  );
}

/* ── Step 1: 文档结构树 ── */
function Step1() {
  return (
    <div className="q4-step1">
      <span className="bg-stripe-band-r" />
      <main className="q4-main">
        <span className="chip-accent q4-tree-label">DOCUMENT STRUCTURE</span>

        <div className="q4-tree">
          {/* Root doc */}
          <div className="q4-tree-root card-stamp">
            <span className="stripe-corner" />
            <FileText className="q4-tree-icon" size={28} />
            <span className="q4-tree-name">Next.js Docs</span>
            <span className="q4-tree-meta">routing.mdx</span>
          </div>

          {/* Arrow down */}
          <span className="q4-tree-arrow">↓</span>

          {/* Parents row */}
          <div className="q4-tree-parents">
            {[
              { name: "## Defining Routes", color: "var(--accent)" },
              { name: "## Dynamic Routes", color: "var(--accent-2)" },
              { name: "## Layouts", color: "var(--accent-3)" },
            ].map((p, i) => (
              <div
                key={i}
                className="q4-tree-parent card-stamp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span
                  className="q4-parent-bar"
                  style={{ background: p.color }}
                />
                <span className="q4-parent-name">{p.name}</span>
              </div>
            ))}
          </div>

          {/* Arrow down */}
          <span className="q4-tree-arrow">↓</span>

          {/* Children */}
          <div className="q4-tree-children">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="q4-tree-child"
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              >
                <span className="q4-child-dot" />
                <span className="q4-child-text">~300 chars</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: 左右分屏 ── */
function Step2() {
  return (
    <div className="q4-step2">
      <span className="bg-shape-mint" />
      <main className="q4-main">
        <div className="q4-split-row">
          {/* Child - retrieval */}
          <div className="card-stamp q4-split-card">
            <span className="stripe-corner" />
            <span className="chip-accent">CHILD · 召回</span>
            <div className="q4-split-vis">
              <div className="q4-chunk-grid">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="q4-chunk-block">
                    <span className="q4-chunk-line" />
                    <span className="q4-chunk-line short" />
                  </div>
                ))}
              </div>
            </div>
            <span className="q4-split-desc">小粒度 · 精确匹配</span>
            <span className="q4-split-sub">chunkSize: 300, overlap: 30</span>
          </div>

          <span className="q4-split-vs">+</span>

          {/* Parent - generation */}
          <div className="card-stamp-mint q4-split-card">
            <span className="stripe-corner-mint" />
            <span className="chip-ink">PARENT · 生成</span>
            <div className="q4-split-vis">
              <div className="q4-parent-block">
                <span className="q4-parent-line" />
                <span className="q4-parent-line" />
                <span className="q4-parent-line" />
                <span className="q4-parent-line" />
                <span className="q4-parent-line short" />
              </div>
            </div>
            <span className="q4-split-desc">完整 H2 Section 上下文</span>
            <span className="q4-split-sub">包含 heading + 全部 body</span>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Step 3: v0.3→v0.4 反直觉对比 ── */
function Step3() {
  return (
    <div className="q4-step3">
      <span className="bg-shape-coral" />
      <main className="q4-main">
        <span className="chip-ink q4-step-label">COUNTER-INTUITIVE</span>

        <div className="q4-counter-row">
          <div className="q4-counter-card card-stamp">
            <span className="stripe-corner" />
            <span className="q4-counter-name">Recall@5</span>
            <div className="q4-counter-change">
              <span className="q4-counter-old">56.7%</span>
              <span className="q4-counter-arrow">→</span>
              <span className="q4-counter-new q4-counter-down">50.0%</span>
            </div>
            <span className="chip-ink q4-counter-badge">↓ 6.7%</span>
          </div>

          <div className="q4-counter-card card-stamp">
            <span className="stripe-corner" />
            <span className="q4-counter-name">Answer Acc</span>
            <div className="q4-counter-change">
              <span className="q4-counter-old">73.3%</span>
              <span className="q4-counter-arrow">→</span>
              <span className="q4-counter-new q4-counter-up">80.0%</span>
            </div>
            <span className="chip-mint q4-counter-badge">↑ 6.7%</span>
          </div>
        </div>

        <div className="q4-counter-insight">
          <Brain className="q4-counter-icon" size={28} />
          <span className="q4-counter-text">召回少了，答案反而更准</span>
        </div>
      </main>
    </div>
  );
}

/* ── Step 4: 代码 + 金句 ── */
function Step4() {
  return (
    <div className="q4-step4">
      <span className="bg-shape-ink" />
      <main className="q4-main">
        <span className="chip-accent q4-code-label">CODE · src/chunking/markdown-aware.ts</span>

        <div className="card-stamp-ink q4-code-card">
          <span className="stripe-corner" />
          <div className="q4-code-block">
            <div className="q4-code-line">
              <span className="tk-k">function</span>
              <span className="tk-f"> splitByH2</span>
              <span className="tk-p">(content: string) {"{"}</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="tk-k">const</span>
              <span className="tk-v"> lines </span>
              <span className="tk-o">=</span>
              <span className="tk-v"> content</span>
              <span className="tk-p">.</span>
              <span className="tk-f">split</span>
              <span className="tk-p">(</span>
              <span className="tk-s">&#39;\n&#39;</span>
              <span className="tk-p">);</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="q4-code-comment">// 按 ## 标题切分 section</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="tk-k">for</span>
              <span className="tk-p"> (</span>
              <span className="tk-k">const</span>
              <span className="tk-v"> line </span>
              <span className="tk-k">of</span>
              <span className="tk-v"> lines</span>
              <span className="tk-p">) {"{"}</span>
            </div>
            <div className="q4-code-line q4-code-indent2">
              <span className="tk-k">if</span>
              <span className="tk-p"> (line.</span>
              <span className="tk-f">startsWith</span>
              <span className="tk-p">(</span>
              <span className="tk-s">&#39;## &#39;</span>
              <span className="tk-p">)) {"{"}</span>
            </div>
            <div className="q4-code-line q4-code-indent3">
              <span className="q4-code-comment">// 新开一个 parent section</span>
            </div>
            <div className="q4-code-line q4-code-indent2">
              <span className="tk-p">{"}"}</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="tk-p">{"}"}</span>
            </div>
            <div className="q4-code-line">
              <span className="tk-p">{"}"}</span>
            </div>
            <div className="q4-code-line" />
            <div className="q4-code-line">
              <span className="q4-code-comment">// 父块: 整个 H2 section</span>
            </div>
            <div className="q4-code-line">
              <span className="tk-v">parentMap</span>
              <span className="tk-p">.</span>
              <span className="tk-f">set</span>
              <span className="tk-p">(parentId, {"{"} heading, content, source {"}"});</span>
            </div>
            <div className="q4-code-line" />
            <div className="q4-code-line">
              <span className="q4-code-comment">// 子块: section 内部 ~300 字切分</span>
            </div>
            <div className="q4-code-line">
              <span className="tk-k">const</span>
              <span className="tk-v"> splits </span>
              <span className="tk-o">=</span>
              <span className="tk-k"> await</span>
              <span className="tk-v"> splitter</span>
              <span className="tk-p">.</span>
              <span className="tk-f">createDocuments</span>
              <span className="tk-p">(</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="tk-p">[section.body],</span>
            </div>
            <div className="q4-code-line q4-code-indent">
              <span className="tk-p">[{"{"} source, title,</span>
              <span className="tk-v"> parentId</span>
              <span className="tk-p">, sectionHeading {"}"}]</span>
            </div>
            <div className="q4-code-line">
              <span className="tk-p">);</span>
            </div>
          </div>
        </div>

        <div className="q4-quote">
          <span className="q4-quote-mark">&ldquo;</span>
          <p className="q4-quote-text">
            chunking 的目标不是召回多，是召回对的同时，生成对。
          </p>
        </div>
      </main>
    </div>
  );
}
