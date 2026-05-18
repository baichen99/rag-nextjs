export const narrations = [
  "错误答案：换个更好的 LLM。正确答案：加 Reranker。从 top 20 精排到 top 5。",
  "检索器是 Bi-encoder。问题和文档分开编码，速度快，但粗。Reranker 是 Cross-encoder。问题和文档一起编码，更准，但更慢。",
  "v0.2 到 v0.3。Recall 从 50% 涨到 56.7%。Acc 还是 73.3%。",
  "Recall 涨了，Acc 没动。Reranker 主要解决排序。不是召回，也不是答案质量。",
  "我们用的阿里百炼 gte-rerank。国内直接可用。看 `src/reranking/dashscope.ts`。20 行手写 wrapper。",
  "比如 e01：App Router 默认渲染模式。baseline 召回错，rerank 排下去。这就是 rerank 的价值。",
];
