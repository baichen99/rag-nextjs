import { env } from '../lib/env';

interface RerankInput {
  content: string;
  source: string;
}

interface RerankResult extends RerankInput {
  rerankScore: number;
}

export async function rerank(
  query: string,
  docs: RerankInput[],
  topN = 5
): Promise<RerankResult[]> {
  if (docs.length === 0) return [];

  const response = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gte-rerank',
        input: {
          query,
          documents: docs.map((d) => d.content),
        },
        parameters: {
          top_n: Math.min(topN, docs.length),
          return_documents: false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Rerank failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    output: { results: { index: number; relevance_score: number }[] };
  };

  return data.output.results.map((r) => ({
    ...docs[r.index],
    rerankScore: r.relevance_score,
  }));
}
