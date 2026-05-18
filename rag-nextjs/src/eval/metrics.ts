import { PipelineResult } from '../pipelines/types';
import { EvalQuestion } from './dataset';

export interface EvalMetrics {
  version: string;
  total: number;
  recallAt5: number;
  answerAccuracy: number;
  avgLatency: number;
  categoryBreakdown: Record<string, { recall: number; accuracy: number; count: number }>;
}

export function computeRecallAt5(
  result: PipelineResult,
  question: EvalQuestion
): number {
  const sources = result.retrievedChunks.map((c) => c.source);
  const expected = question.expectedSources;
  if (expected.length === 0) return 0;

  let hit = 0;
  for (const exp of expected) {
    // 允许部分匹配，比如 '01-app/routing.mdx' 匹配 'routing.mdx'
    if (sources.some((s) => s.includes(exp) || exp.includes(s))) {
      hit++;
    }
  }
  return hit / expected.length;
}

export function computeAnswerAccuracy(
  result: PipelineResult,
  question: EvalQuestion
): number {
  const answer = result.answer.toLowerCase();
  const keywords = question.expectedKeywords.map((k) => k.toLowerCase());
  if (keywords.length === 0) return 0;

  const hit = keywords.filter((k) => answer.includes(k)).length;
  return hit >= keywords.length * 0.5 ? 1 : 0;
}

export function aggregateMetrics(
  version: string,
  results: { question: EvalQuestion; result: PipelineResult }[]
): EvalMetrics {
  const total = results.length;
  let totalRecall = 0;
  let totalAcc = 0;
  let totalLatency = 0;

  const categoryMap: Record<string, { recallSum: number; accSum: number; count: number }> = {};

  for (const { question, result } of results) {
    const recall = computeRecallAt5(result, question);
    const acc = computeAnswerAccuracy(result, question);
    totalRecall += recall;
    totalAcc += acc;
    totalLatency += result.timings.total;

    const cat = question.category;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { recallSum: 0, accSum: 0, count: 0 };
    }
    categoryMap[cat].recallSum += recall;
    categoryMap[cat].accSum += acc;
    categoryMap[cat].count++;
  }

  const categoryBreakdown: EvalMetrics['categoryBreakdown'] = {};
  for (const [cat, data] of Object.entries(categoryMap)) {
    categoryBreakdown[cat] = {
      recall: data.count > 0 ? data.recallSum / data.count : 0,
      accuracy: data.count > 0 ? data.accSum / data.count : 0,
      count: data.count,
    };
  }

  return {
    version,
    total,
    recallAt5: totalRecall / total,
    answerAccuracy: totalAcc / total,
    avgLatency: totalLatency / total,
    categoryBreakdown,
  };
}
