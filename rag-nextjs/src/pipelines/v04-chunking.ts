import fs from 'fs';
import { getChromaStore } from '../lib/chroma';
import { llm } from '../lib/llm';
import { buildHybridRetriever } from '../retrieval/hybrid';
import { rerank } from '../reranking/dashscope';
import { Pipeline, PipelineResult } from './types';

let storePromise: ReturnType<typeof getChromaStore> | null = null;
function getStore() {
  if (!storePromise) storePromise = getChromaStore('nextjs_markdown');
  return storePromise;
}

interface ParentChunk {
  id: string;
  content: string;
  source: string;
  title: string;
}

let parentMapPromise: Promise<Map<string, ParentChunk>> | null = null;
async function getParentMap(): Promise<Map<string, ParentChunk>> {
  if (parentMapPromise) return parentMapPromise;
  parentMapPromise = (async () => {
    const data = JSON.parse(fs.readFileSync('data/parents-markdown.json', 'utf-8')) as ParentChunk[];
    const map = new Map<string, ParentChunk>();
    for (const p of data) {
      map.set(p.id, p);
    }
    return map;
  })();
  return parentMapPromise;
}

export const v04: Pipeline = {
  version: 'v0.4',
  name: 'Better Chunking',
  description: 'Markdown-aware chunking + parent-child + Hybrid + Rerank',

  async ask(question): Promise<PipelineResult> {
    const t0 = Date.now();
    const store = await getStore();
    const parentMap = await getParentMap();

    const tRet0 = Date.now();
    const hybridRetriever = buildHybridRetriever(store, 20, 'data/chunks-markdown.json');
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

    // 取 parentId 去重
    const seenParents = new Set<string>();
    const parentContents: string[] = [];
    const retrievedChunks = [];

    for (const r of reranked) {
      // 需要找到对应的 doc 来获取 parentId
      const doc = docs.find((d) => d.pageContent === r.content);
      const parentId = (doc?.metadata?.parentId as string) ?? '';
      if (parentId && !seenParents.has(parentId)) {
        seenParents.add(parentId);
        const parent = parentMap.get(parentId);
        if (parent) {
          parentContents.push(parent.content);
          retrievedChunks.push({
            content: parent.content,
            source: parent.source,
            rerankScore: r.rerankScore,
          });
        }
      }
    }

    const context = parentContents.join('\n\n---\n\n');
    const prompt = `根据下面的 Next.js 文档片段回答问题。如果答不出，说"文档里没找到"。

文档片段：
${context}

问题：${question}`;

    const tGen0 = Date.now();
    const response = await llm.invoke(prompt);
    const tGen1 = Date.now();

    return {
      answer: response.content as string,
      retrievedChunks,
      timings: {
        retrieval: tRet1 - tRet0,
        rerank: tRerank1 - tRerank0,
        generation: tGen1 - tGen0,
        total: Date.now() - t0,
      },
    };
  },
};
