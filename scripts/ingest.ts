import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { embeddings } from '../src/lib/embeddings';
import { env } from '../src/lib/env';
import { createMarkdownAwareChunks } from '../src/chunking/markdown-aware';

interface RawDoc {
  content: string;
  source: string;
  title: string;
}

async function loadDocs(): Promise<RawDoc[]> {
  const files = await glob('data/nextjs-docs/01-app/**/*.mdx');
  console.log(`Found ${files.length} .mdx files`);

  return files.map((f) => {
    const raw = fs.readFileSync(f, 'utf-8');
    const { content, data } = matter(raw);
    return {
      content,
      source: f.replace('data/nextjs-docs/', ''),
      title: data.title ?? '',
    };
  });
}

async function ingestFixedSize(rawDocs: RawDoc[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const allChunks: Document[] = [];
  for (const doc of rawDocs) {
    const splits = await splitter.createDocuments(
      [doc.content],
      [{ source: doc.source, title: doc.title }]
    );
    allChunks.push(...splits);
  }

  fs.writeFileSync(
    'data/chunks-fixed.json',
    JSON.stringify(
      allChunks.map((c) => ({
        pageContent: c.pageContent,
        metadata: c.metadata,
      }))
    )
  );
  console.log(`[fixed] ${allChunks.length} chunks`);

  const BATCH = 10;
  for (let i = 0; i < allChunks.length; i += BATCH) {
    const batch = allChunks.slice(i, i + BATCH);
    if (i === 0) {
      await Chroma.fromDocuments(batch, embeddings, {
        collectionName: 'nextjs_fixed',
        url: env.CHROMA_URL || undefined,
      });
    } else {
      const store = await Chroma.fromExistingCollection(embeddings, {
        collectionName: 'nextjs_fixed',
        url: env.CHROMA_URL || undefined,
      });
      await store.addDocuments(batch);
    }
    console.log(
      `[fixed] ingested ${Math.min(i + BATCH, allChunks.length)}/${allChunks.length}`
    );
  }
}

async function ingestMarkdownAware(rawDocs: RawDoc[]) {
  const { childChunks, parentMap } = await createMarkdownAwareChunks(rawDocs);

  fs.writeFileSync(
    'data/chunks-markdown.json',
    JSON.stringify(
      childChunks.map((c) => ({
        pageContent: c.pageContent,
        metadata: c.metadata,
      }))
    )
  );

  const parentsArray = Array.from(parentMap.values());
  fs.writeFileSync('data/parents-markdown.json', JSON.stringify(parentsArray));
  console.log(`[markdown] ${childChunks.length} child chunks, ${parentsArray.length} parents`);

  const BATCH = 10;
  for (let i = 0; i < childChunks.length; i += BATCH) {
    const batch = childChunks.slice(i, i + BATCH);
    if (i === 0) {
      await Chroma.fromDocuments(batch, embeddings, {
        collectionName: 'nextjs_markdown',
        url: env.CHROMA_URL || undefined,
      });
    } else {
      const store = await Chroma.fromExistingCollection(embeddings, {
        collectionName: 'nextjs_markdown',
        url: env.CHROMA_URL || undefined,
      });
      await store.addDocuments(batch);
    }
    console.log(
      `[markdown] ingested ${Math.min(i + BATCH, childChunks.length)}/${childChunks.length}`
    );
  }
}

async function main() {
  const rawDocs = await loadDocs();
  console.log(`Loaded ${rawDocs.length} files`);

  // 策略 1: fixed-size
  await ingestFixedSize(rawDocs);

  // 策略 2: markdown-aware
  await ingestMarkdownAware(rawDocs);

  console.log('All done!');
}

main().catch(console.error);
