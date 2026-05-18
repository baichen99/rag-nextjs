"use client";

import { useState } from "react";

interface RetrievedChunk {
  content: string;
  source: string;
  score?: number;
  rerankScore?: number;
}

interface PipelineResult {
  answer: string;
  retrievedChunks: RetrievedChunk[];
  rewrittenQueries?: string[];
  timings: {
    retrieval: number;
    rerank?: number;
    generation: number;
    total: number;
  };
}

const VERSIONS = [
  { id: "v0.1", name: "Baseline", desc: "Vector only", color: "bg-gray-500" },
  { id: "v0.2", name: "Hybrid", desc: "BM25 + Vector", color: "bg-blue-500" },
  { id: "v0.3", name: "Rerank", desc: "Hybrid + Rerank", color: "bg-purple-500" },
  { id: "v0.4", name: "Chunking", desc: "Markdown + Parent", color: "bg-green-500" },
  { id: "v0.5", name: "Query Rewrite", desc: "Multi-Query + History", color: "bg-orange-500" },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(VERSIONS.map((v) => v.id)));
  const [results, setResults] = useState<Record<string, PipelineResult | { error: string } | null>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleVersion = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const toAsk = Array.from(selected);
    setLoading(new Set(toAsk));
    setResults({});

    await Promise.all(
      toAsk.map(async (version) => {
        try {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, version }),
          });
          const data = await res.json();
          setResults((prev) => ({ ...prev, [version]: data }));
        } catch (e: any) {
          setResults((prev) => ({ ...prev, [version]: { error: e.message } }));
        }
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(version);
          return next;
        });
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">next-docs-rag</h1>
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="text-gray-400">5-version RAG comparison</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about Next.js..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAsk}
              disabled={loading.size > 0 || !question.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading.size > 0 ? "Asking..." : "Ask"}
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            {VERSIONS.map((v) => (
              <label key={v.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggleVersion(v.id)}
                  className="rounded border-gray-300"
                />
                <span className={`inline-block w-2 h-2 rounded-full ${v.color}`} />
                <span className="text-gray-700">{v.id}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {VERSIONS.filter((v) => selected.has(v.id)).map((v) => {
            const result = results[v.id];
            const isLoading = loading.has(v.id);
            const isError = result && "error" in result;
            const pipelineResult = result && !isError ? (result as PipelineResult) : null;

            return (
              <div key={v.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className={`${v.color} text-white px-3 py-2`}>
                  <div className="font-bold text-sm">{v.id}</div>
                  <div className="text-xs opacity-90">{v.name}</div>
                </div>

                <div className="p-3 min-h-[200px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                    </div>
                  ) : isError ? (
                    <div className="text-red-600 text-sm">{(result as { error: string }).error}</div>
                  ) : pipelineResult ? (
                    <>
                      <div className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">
                        {pipelineResult.answer}
                      </div>

                      {pipelineResult.rewrittenQueries && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-500 mb-1">Rewritten Queries:</div>
                          {pipelineResult.rewrittenQueries.map((q, i) => (
                            <div key={i} className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 mb-1">
                              {q}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [v.id]: !prev[v.id] }))
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2"
                      >
                        {expanded[v.id] ? "Hide" : "Show"} {pipelineResult.retrievedChunks.length} chunks
                      </button>

                      {expanded[v.id] && (
                        <div className="space-y-2 mb-3">
                          {pipelineResult.retrievedChunks.map((chunk, i) => (
                            <div key={i} className="bg-gray-50 rounded p-2 text-xs">
                              <div className="font-medium text-gray-700 mb-1">{chunk.source}</div>
                              <div className="text-gray-600 line-clamp-4">{chunk.content}</div>
                              {chunk.score !== undefined && (
                                <div className="text-gray-400 mt-1">score: {chunk.score.toFixed(3)}</div>
                              )}
                              {chunk.rerankScore !== undefined && (
                                <div className="text-purple-500 mt-1">rerank: {chunk.rerankScore.toFixed(3)}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                        <div>retrieval: {(pipelineResult.timings.retrieval / 1000).toFixed(1)}s</div>
                        {pipelineResult.timings.rerank !== undefined && (
                          <div>rerank: {(pipelineResult.timings.rerank / 1000).toFixed(1)}s</div>
                        )}
                        <div>generation: {(pipelineResult.timings.generation / 1000).toFixed(1)}s</div>
                        <div className="font-medium text-gray-600">total: {(pipelineResult.timings.total / 1000).toFixed(1)}s</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm text-center py-8">Ask a question to see results</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
