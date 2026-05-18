import { ExternalLink, Bookmark } from "lucide-react";
import "./Summary.css";

interface Props {
  step: number;
}

export default function Summary({ step }: Props) {
  return (
    <div className="su-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  );
}

/* ── Step 0: Cheatsheet 5 行 Q&A ── */
function Step0() {
  const rows = [
    { q: "RAG 召回率怎么评估？", a: "Recall@5 + Acc，分 4 类看", highlight: "分类别看" },
    { q: "怎么提升召回？", a: "Hybrid Search · BM25 + Vector + RRF", highlight: "Hybrid" },
    { q: "召回对了，答案为啥还错？", a: "加 Reranker · Cross-encoder 精排", highlight: "Reranker" },
    { q: "长文档怎么处理？", a: "Parent-Child Chunking · 按 H2 切分", highlight: "Parent-Child" },
    { q: "多轮对话怎么处理？", a: "场景区分 · 别盲目 Multi-Query", highlight: "场景区分" },
  ];

  return (
    <div className="su-step0">
      <span className="bg-shape-mint" />
      <main className="su-main">
        <span className="chip-accent su-top-label">CHEATSHEET · 截图保存</span>
        <div className="su-sheet">
          {rows.map((r, i) => (
            <div
              key={i}
              className="card-stamp su-sheet-row"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="stripe-corner" />
              <div className="su-sheet-q">
                <span className="su-sheet-num">Q{i + 1}</span>
                <span className="su-sheet-qtext">{r.q}</span>
              </div>
              <div className="su-sheet-a">
                <span className="su-sheet-atext">{r.a}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Step 1: 金句 + VIZ-01 折线图回收 ── */
function Step1() {
  const data = [
    { v: "v0.1", r: 48.3, a: 63.3 },
    { v: "v0.2", r: 50.0, a: 73.3 },
    { v: "v0.3", r: 56.7, a: 73.3 },
    { v: "v0.4", r: 50.0, a: 80.0 },
    { v: "v0.5", r: 40.0, a: 60.0 },
  ];

  const width = 720;
  const height = 260;
  const padL = 56;
  const padR = 40;
  const padT = 24;
  const padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const x = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const y = (v: number) => padT + chartH - (v / 100) * chartH;

  const rPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.r)}`).join(" ");
  const aPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.a)}`).join(" ");

  return (
    <div className="su-step1">
      <span className="bg-stripe-band-r" />
      <main className="su-main-chart">
        <div className="su-quote-wrap">
          <span className="su-quote-mark">&ldquo;</span>
          <p className="su-quote-line1">
            RAG 不是默认答案
          </p>
          <p className="su-quote-line2">
            但选对了组件，RAG 仍然是 <span className="su-highlight">80%</span> 场景的最优解
          </p>
        </div>

        <div className="card-stamp su-chart-card">
          <span className="stripe-corner" />
          <svg viewBox={`0 0 ${width} ${height}`} className="su-chart-svg">
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y(tick)}
                  x2={width - padR}
                  y2={y(tick)}
                  stroke="var(--rule)"
                  strokeWidth={1}
                  strokeDasharray={tick === 0 ? "" : "4 4"}
                />
                <text x={padL - 6} y={y(tick) + 4} className="su-tick-label">
                  {tick}%
                </text>
              </g>
            ))}

            <path d={rPath} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={`r-${i}`} cx={x(i)} cy={y(d.r)} r={5} fill="var(--accent)" />
            ))}

            <path d={aPath} fill="none" stroke="var(--accent-2)" strokeWidth={3} strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={`a-${i}`} cx={x(i)} cy={y(d.a)} r={5} fill="var(--accent-2)" />
            ))}

            {data.map((d, i) => (
              <text key={d.v} x={x(i)} y={height - 10} className="su-x-label">
                {d.v}
              </text>
            ))}

            <g transform={`translate(${width - 180}, 12)`}>
              <circle cx={0} cy={0} r={4} fill="var(--accent)" />
              <text x={10} y={4} className="su-legend-text">Recall@5</text>
              <circle cx={80} cy={0} r={4} fill="var(--accent-2)" />
              <text x={90} y={4} className="su-legend-text">Acc</text>
            </g>
          </svg>
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: GitHub 链接 ── */
function Step2() {
  return (
    <div className="su-step2">
      <span className="bg-shape-ink" />
      <main className="su-main">
        <span className="chip-accent su-gh-label">OPEN SOURCE</span>

        <div className="card-stamp-ink su-gh-card">
          <span className="stripe-corner" />
          <div className="su-gh-icon-row">
            <span className="su-gh-logo">GH</span>
            <span className="su-gh-repo">baichen99/rag-nextjs</span>
          </div>
          <div className="su-gh-desc">
            <span className="su-gh-item">
              <span className="su-gh-dot" style={{ background: "var(--accent)" }} />
              30 题评估集
            </span>
            <span className="su-gh-item">
              <span className="su-gh-dot" style={{ background: "var(--accent-2)" }} />
              5 个版本完整实现
            </span>
            <span className="su-gh-item">
              <span className="su-gh-dot" style={{ background: "var(--accent-3)" }} />
              TypeScript + LangChain.js
            </span>
          </div>
          <div className="su-gh-url">
            <ExternalLink size={16} />
            <span>github.com/baichen99/rag-nextjs</span>
          </div>
        </div>

        <span className="su-gh-sub">自己跑一遍，胜过看 10 个教程</span>
      </main>
    </div>
  );
}

/* ── Step 3: CTA 收藏引导 ── */
function Step3() {
  return (
    <div className="su-step3">
      <span className="bg-shape-coral" />
      <main className="su-main-cta">
        <div className="su-cta-box">
          <Bookmark className="su-cta-icon" size={56} />
          <p className="su-cta-title">收藏一下</p>
          <p className="su-cta-sub">下次面试前翻出来看</p>
        </div>

        <div className="su-cta-footer">
          <span className="chip-ink">RAG 工业级实践</span>
          <span className="chip-accent">5 个版本 · 真实数据</span>
          <span className="chip-mint">代码开源</span>
        </div>
      </main>
    </div>
  );
}
