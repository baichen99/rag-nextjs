import { Chroma } from '@langchain/community/vectorstores/chroma';
import { embeddings } from './embeddings';
import { env } from './env';

const storeCache = new Map<string, Promise<Chroma>>();

export async function getChromaStore(collectionName: string) {
  const cached = storeCache.get(collectionName);
  if (cached) return cached;

  const promise = (async () => {
    try {
      return await Chroma.fromExistingCollection(embeddings, {
        collectionName,
        url: env.CHROMA_URL || undefined,
      });
    } catch {
      // Collection 不存在，创建一个空的
      return await Chroma.fromDocuments([], embeddings, {
        collectionName,
        url: env.CHROMA_URL || undefined,
      });
    }
  })();

  storeCache.set(collectionName, promise);
  return promise;
}
