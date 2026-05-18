import { BM25Retriever } from '@langchain/community/retrievers/bm25';
import { EnsembleRetriever } from '@langchain/classic/retrievers/ensemble';
import { Document } from '@langchain/core/documents';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import fs from 'fs';

export function buildHybridRetriever(
  vectorStore: Chroma,
  k = 5,
  chunkFile = 'data/chunks-fixed.json'
) {
  const cached = JSON.parse(fs.readFileSync(chunkFile, 'utf-8'));
  const docs = cached.map(
    (c: { pageContent: string; metadata: Record<string, unknown> }) =>
      new Document({ pageContent: c.pageContent, metadata: c.metadata })
  );

  const vectorRetriever = vectorStore.asRetriever({ k });
  const bm25Retriever = BM25Retriever.fromDocuments(docs, { k });

  return new EnsembleRetriever({
    retrievers: [vectorRetriever, bm25Retriever],
    weights: [0.6, 0.4],
  });
}
