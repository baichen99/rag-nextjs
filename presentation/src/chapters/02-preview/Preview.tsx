import "./Preview.css";

interface Props {
  step: number;
}

export default function Preview({ step }: Props) {
  return (
    <div className="pr-scene">
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
    </div>
  );
}

/* ── Step 0: 5 个问题逐条揭示 ── */
function Step0() {
  const questions = [
    { num: "Q1", text: "RAG 召回率怎么评估？", accent: true },
    { num: "Q2", text: "怎么提升召回？", accent: false },
    { num: "Q3", text: "召回对了，答案为啥还错？", accent: false },
    { num: "Q4", text: "长文档怎么处理？", accent: false },
    { num: "Q5", text: "多轮对话怎么处理？", accent: true },
  ];

  return (
    <div className="pr-step0">
      <span className="bg-shape-mint" />
      <main className="pr-main">
        <span className="chip-ink pr-top-label">5 QUESTIONS</span>
        <div className="pr-q-list">
          {questions.map((q, i) => (
            <div
              key={q.num}
              className={`card-stamp pr-q-card ${q.accent ? "pr-q-accent" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="pr-q-num">{q.num}</span>
              <span className="pr-q-text">{q.text}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Step 1: VIZ-01 折线图 ── */
function Step1() {
  // Data: version -> [recall, accuracy]
  const data = [
    { v: "v0.1", r: 48.3, a: 63.3 },
    { v: "v0.2", r: 50.0, a: 73.3 },
    { v: "v0.3", r: 56.7, a: 73.3 },
    { v: "v0.4", r: 50.0, a: 80.0 },
    { v: "v0.5", r: 40.0, a: 60.0 },
  ];

  const width = 800;
  const height = 320;
  const padL = 64;
  const padR = 48;
  const padT = 32;
  const padB = 48;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const x = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const yR = (v: number) => padT + chartH - (v / 100) * chartH;
  const yA = (v: number) => padT + chartH - (v / 100) * chartH;

  const rPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yR(d.r)}`).join(" ");
  const aPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yA(d.a)}`).join(" ");

  return (
    <div className="pr-step1">
      <span className="bg-stripe-band-l" />
      <main className="pr-main-chart">
        <span className="chip-accent pr-chart-label">EVAL RESULTS</span>

        <div className="card-stamp pr-chart-card">
          <span className="stripe-corner" />
          <svg viewBox={`0 0 ${width} ${height}`} className="pr-chart-svg">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={yR(tick)}
                  x2={width - padR}
                  y2={yR(tick)}
                  stroke="var(--rule)"
                  strokeWidth={1}
                  strokeDasharray={tick === 0 ? "" : "4 4"}
                />
                <text x={padL - 8} y={yR(tick) + 4} className="pr-tick-label">
                  {tick}%
                </text>
              </g>
            ))}

            {/* Recall@5 line */}
            <path d={rPath} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={`r-${i}`} cx={x(i)} cy={yR(d.r)} r={6} fill="var(--accent)" />
            ))}

            {/* Answer Acc line */}
            <path d={aPath} fill="none" stroke="var(--accent-2)" strokeWidth={3} strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={`a-${i}`} cx={x(i)} cy={yA(d.a)} r={6} fill="var(--accent-2)" />
            ))}

            {/* X labels */}
            {data.map((d, i) => (
              <text key={d.v} x={x(i)} y={height - 12} className="pr-x-label">
                {d.v}
              </text>
            ))}

            {/* Legend */}
            <g transform={`translate(${width - 200}, 16)`}>
              <circle cx={0} cy={0} r={5} fill="var(--accent)" />
              <text x={12} y={4} className="pr-legend-text">Recall@5</text>
              <circle cx={90} cy={0} r={5} fill="var(--accent-2)" />
              <text x={102} y={4} className="pr-legend-text">Answer Acc</text>
            </g>
          </svg>

          {/* v0.5 crash annotation */}
          <div className="pr-crash-anno">
            <span className="chip-accent">CRASH</span>
            <span className="pr-crash-text">v0.5 全面回退 ↓</span>
          </div>
        </div>

        {/* Tech stack chips */}
        <div className="pr-tech-row">
          {["LangChain.js", "DeepSeek", "阿里百炼", "Chroma"].map((t) => (
            <span key={t} className="chip-ink">{t}</span>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Step 2: VIZ-02 5 列并排 UI 示意 ── */
function Step2() {
  const versions = [
    { id: "v0.1", name: "Baseline", tech: "Vector only", color: "var(--text-mute)" },
    { id: "v0.2", name: "Hybrid", tech: "BM25 + Vector", color: "var(--accent-2)" },
    { id: "v0.3", name: "Rerank", tech: "Hybrid + Rerank", color: "var(--accent)" },
    { id: "v0.4", name: "Chunking", tech: "Markdown + Parent", color: "var(--accent-3)" },
    { id: "v0.5", name: "Rewrite", tech: "Multi-Query + History", color: "var(--danger)" },
  ];

  return (
    <div className="pr-step2">
      <span className="bg-shape-coral" />
      <main className="pr-main-grid">
        <span className="chip-ink pr-grid-label">5 VERSIONS SIDE BY SIDE</span>

        <div className="pr-version-grid">
          {versions.map((v, i) => (
            <div
              key={v.id}
              className={`card-stamp pr-version-card ${v.id === "v0.5" ? "pr-v5-card" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span
                className="pr-v-bar"
                style={{ background: v.color }}
              />
              <span className="pr-v-id">{v.id}</span>
              <span className="pr-v-name">{v.name}</span>
              <span className="pr-v-tech">{v.tech}</span>
              {v.id === "v0.5" && (
                <span className="chip-accent pr-v-crash">回退</span>
              )}
            </div>
          ))}
        </div>

        <div className="pr-gh-hint">
          <span className="chip-mint">GITHUB</span>
          <span className="pr-gh-text">baichen99/rag-nextjs · 30 题评估集 · 自己跑</span>
        </div>
      </main>
    </div>
  );
}
