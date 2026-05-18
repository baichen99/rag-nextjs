import fs from 'fs';
import { EVAL_SET } from '../src/eval/dataset';
import { aggregateMetrics } from '../src/eval/metrics';
import { v01 } from '../src/pipelines/v01-baseline';
import { v02 } from '../src/pipelines/v02-hybrid';
import { v03 } from '../src/pipelines/v03-rerank';
import { v04 } from '../src/pipelines/v04-chunking';
import { v05 } from '../src/pipelines/v05-query-rewrite';
import { Pipeline } from '../src/pipelines/types';

const pipelines: Record<string, Pipeline> = {
  'v0.1': v01,
  'v0.2': v02,
  'v0.3': v03,
  'v0.4': v04,
  'v0.5': v05,
};

async function main() {
  const version = process.argv[2];
  if (!version || !pipelines[version]) {
    console.error(`Usage: pnpm eval <version>`);
    console.error(`Available: ${Object.keys(pipelines).join(', ')}`);
    process.exit(1);
  }

  const pipeline = pipelines[version];
  console.log(`\nEvaluating ${version} ${pipeline.name}...\n`);

  const results: { question: typeof EVAL_SET[0]; result: Awaited<ReturnType<Pipeline['ask']>> }[] = [];

  for (let i = 0; i < EVAL_SET.length; i++) {
    const q = EVAL_SET[i];
    console.log(`[${i + 1}/${EVAL_SET.length}] ${q.id}: ${q.question.slice(0, 60)}...`);
    try {
      const result = await pipeline.ask(q.question, q.history);
      results.push({ question: q, result });
      // 避免触发限流
      await sleep(500);
    } catch (e: any) {
      console.error(`  ERROR: ${e.message}`);
      results.push({
        question: q,
        result: {
          answer: `ERROR: ${e.message}`,
          retrievedChunks: [],
          timings: { retrieval: 0, generation: 0, total: 0 },
        },
      });
    }
  }

  const metrics = aggregateMetrics(version, results);

  console.log(`\n${version} ${pipeline.name}`);
  console.log(`  Recall@5:      ${(metrics.recallAt5 * 100).toFixed(1)}%`);
  console.log(`  Answer acc:    ${(metrics.answerAccuracy * 100).toFixed(1)}%`);
  console.log(`  Avg latency:   ${(metrics.avgLatency / 1000).toFixed(1)}s`);
  console.log(`  By category:`);
  for (const [cat, data] of Object.entries(metrics.categoryBreakdown)) {
    console.log(`    ${cat}: recall=${(data.recall * 100).toFixed(0)}%, acc=${(data.accuracy * 100).toFixed(0)}%, n=${data.count}`);
  }

  fs.mkdirSync('data/eval-results', { recursive: true });
  fs.writeFileSync(
    `data/eval-results/${version.replace('.', '_')}.json`,
    JSON.stringify({ metrics, details: results.map((r) => ({
      id: r.question.id,
      question: r.question.question,
      answer: r.result.answer,
      recall: metrics.categoryBreakdown[r.question.category]?.recall ?? 0,
      accuracy: metrics.categoryBreakdown[r.question.category]?.accuracy ?? 0,
    })) }, null, 2)
  );
  console.log(`\nSaved to data/eval-results/${version.replace('.', '_')}.json`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
