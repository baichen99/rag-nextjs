export const narrations = [
  "错误答案：chunk_size 调到 1000。正确答案：Markdown-aware 加 Parent-Child Chunking。",
  "按 H2 标题切分。每个 section 是一个 parent。里面再细切成 child。",
  "召回用 child。小粒度，精确匹配。生成用 parent。完整上下文。",
  "v0.3 到 v0.4。Recall 从 56.7% 降到 50%。Acc 从 73.3% 涨到 80%。",
  "召回少了，答案反而更准。chunking 的目标不是召回多，是召回对的同时，生成对。",
];
