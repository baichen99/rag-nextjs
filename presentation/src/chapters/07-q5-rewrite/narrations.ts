export const narrations = [
  "错误答案：加上对话历史就行。教科书答案：Multi-Query 加 History-aware Rewriting。",
  "我们照做了。v0.4 到 v0.5。Recall 从 50% 跌到 40%。Acc 从 80% 跌到 60%。全面回退。",
  "为什么？Multi-Query 把简单事实问题改写成 3 个变体。语义漂移。召回了一堆噪声。",
  "比如问 App Router 默认是不是 Server Component。Multi-Query 改写成：Next.js 15 默认渲染模式是什么。Server Component 和 Client Component 区别。",
  "原问题已经够精确了。改写后反而召回更多无关文档。factual 类 recall 从 62.5% 跌到 37.5%。evolution 类全面崩盘。",
  "真正的答案：有历史就用 history rewriting。简单事实问题不要 multi-query。场景区分。",
  "教科书答案在我数据集上挂了。这就是工业级 RAG 跟教程的差距。",
  "教科书答案在我数据集上挂了。这就是工业级 RAG 跟教程的差距。",
];
