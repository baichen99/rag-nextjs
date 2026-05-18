import { getChromaStore } from '../lib/chroma';
import { llm } from '../lib/llm';
import { Pipeline, PipelineResult } from './types';

let storePromise: ReturnType<typeof getChromaStore> | null = null;
function getStore() {
  if (!storePromise) storePromise = getChromaStore('nextjs_fixed');
  return storePromise;
}

export const v01: Pipeline = {
  version: 'v0.1',
  name: 'Baseline (Vector only)',
  description: '最朴素的 RAG: fixed-size chunking + 纯向量检索 + 直接生成',

  async ask(question): Promise<PipelineResult> {
    const t0 = Date.now();
    const store = await getStore();

    const tRet0 = Date.now();
    const results = await store.similaritySearchWithScore(question, 5);
    const tRet1 = Date.now();

    const context = results.map(([doc]) => doc.pageContent).join('\n\n---\n\n');
    const prompt = `根据下面的 Next.js 文档片段回答问题。如果答不出，说"文档里没找到"。

文档片段：
${context}

问题：${question}`;

    const tGen0 = Date.now();
    const response = await llm.invoke(prompt);
    const tGen1 = Date.now();

    return {
      answer: response.content as string,
      retrievedChunks: results.map(([doc, score]) => ({
        content: doc.pageContent,
        source: (doc.metadata.source as string) ?? '',
        score,
      })),
      timings: {
        retrieval: tRet1 - tRet0,
        generation: tGen1 - tGen0,
        total: Date.now() - t0,
      },
    };
  },
};
