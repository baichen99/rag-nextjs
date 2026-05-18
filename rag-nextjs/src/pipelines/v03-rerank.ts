import { getChromaStore } from '../lib/chroma';
import { llm } from '../lib/llm';
import { buildHybridRetriever } from '../retrieval/hybrid';
import { rerank } from '../reranking/dashscope';
import { Pipeline, PipelineResult } from './types';

let storePromise: ReturnType<typeof getChromaStore> | null = null;
function getStore() {
  if (!storePromise) storePromise = getChromaStore('nextjs_fixed');
  return storePromise;
}

export const v03: Pipeline = {
  version: 'v0.3',
  name: 'Reranker',
  description: 'Hybrid 取 top 20 → Rerank → 取 top 5',

  async ask(question): Promise<PipelineResult> {
    const t0 = Date.now();
    const store = await getStore();

    const tRet0 = Date.now();
    const hybridRetriever = buildHybridRetriever(store, 20);
    const docs = await hybridRetriever.invoke(question);
    const tRet1 = Date.now();

    const tRerank0 = Date.now();
    const reranked = await rerank(
      question,
      docs.map((d) => ({
        content: d.pageContent,
        source: (d.metadata.source as string) ?? '',
      })),
      5
    );
    const tRerank1 = Date.now();

    const context = reranked.map((d) => d.content).join('\n\n---\n\n');
    const prompt = `根据下面的 Next.js 文档片段回答问题。如果答不出，说"文档里没找到"。

文档片段：
${context}

问题：${question}`;

    const tGen0 = Date.now();
    const response = await llm.invoke(prompt);
    const tGen1 = Date.now();

    return {
      answer: response.content as string,
      retrievedChunks: reranked.map((d) => ({
        content: d.content,
        source: d.source,
        rerankScore: d.rerankScore,
      })),
      timings: {
        retrieval: tRet1 - tRet0,
        rerank: tRerank1 - tRerank0,
        generation: tGen1 - tGen0,
        total: Date.now() - t0,
      },
    };
  },
};
