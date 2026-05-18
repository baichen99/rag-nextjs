export const narrations = [
  "错误答案：再加文档。正确答案：Hybrid Search。BM25 加向量，RRF 融合。",
  "BM25 是关键词匹配。向量是语义匹配。两者互补。",
  "v0.1 到 v0.2。整体 Recall 只涨了 1.7%。看起来没变化？",
  "分类型看。troubleshooting 类 recall 从 28.6% 涨到 42.9%，accuracy 涨到 100%。BM25 对报错关键词是杀手锏。",
  "插个故事。第一次做 Hybrid。LangChain.js 大重构，EnsembleRetriever 迁到了 `@langchain/classic`。找不到官方包，手写了 RRF。",
  "我让他改回来用官方的。Recall 没大变。说明手写的对了。但面试官会因为用了主流包而不再追问实现细节。主流包变了你能不能找到新位置，这本身就是工程素养。",
];
