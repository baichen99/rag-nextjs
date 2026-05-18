import { getChromaStore } from '../lib/chroma';
import { llm } from '../lib/llm';
import { buildHybridRetriever } from '../retrieval/hybrid';
import { Pipeline, PipelineResult } from './types';

let storePromise: ReturnType<typeof getChromaStore> | null = null;
function getStore() {
  if (!storePromise) storePromise = getChromaStore('nextjs_fixed');
  return storePromise;
}

export const v02: Pipeline = {
  version: 'v0.2',
  name: 'Hybrid Search',
  description: 'BM25 + 向量检索混合（RRF 融合）',

  async ask(question): Promise<PipelineResult> {
    const t0 = Date.now();
    const store = await getStore();

    const tRet0 = Date.now();
    const hybridRetriever = buildHybridRetriever(store, 5);
    const docs = await hybridRetriever.invoke(question);
    const tRet1 = Date.now();

    const context = docs.map((d) => d.pageContent).join('\n\n---\n\n');
    const prompt = `根据下面的 Next.js 文档片段回答问题。如果答不出，说"文档里没找到"。

文档片段：
${context}

问题：${question}`;

    const tGen0 = Date.now();
    const response = await llm.invoke(prompt);
    const tGen1 = Date.now();

    return {
      answer: response.content as string,
      retrievedChunks: docs.map((d) => ({
        content: d.pageContent,
        source: (d.metadata.source as string) ?? '',
      })),
      timings: {
        retrieval: tRet1 - tRet0,
        generation: tGen1 - tGen0,
        total: Date.now() - t0,
      },
    };
  },
};
