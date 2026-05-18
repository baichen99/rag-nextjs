# 核心概念与参数详解

本文档讲解项目中涉及的核心技术概念和可调参数。如果你刚接触 RAG，建议按顺序阅读。

---

## 一、Embedding（嵌入）

把文字变成一串数字（向量），使得语义相近的文字在向量空间中距离近。

```
"苹果是水果" -> [0.1, 0.3, -0.5, ...]  (1024 维)
"香蕉很美味" -> [0.2, 0.4, -0.4, ...]  <- 距离很近
"iPhone 15"  -> [-0.8, 0.9, 0.1, ...]  <- 距离很远
```

本项目使用阿里的 `text-embedding-v3`，输出 1024 维向量。

---

## 二、向量数据库

### 怎么工作

1. 预先计算所有文档 chunk 的 Embedding，存入数据库
2. 查询时计算问题的 Embedding
3. 在向量空间中找到最近的 k 个邻居（k-NN）
4. 返回这些 chunk

Chroma 使用 HNSW 索引加速搜索，百万级文档也能毫秒级响应。

### Chroma 的 C/S 架构

Chroma 是**服务端-客户端**架构：

```
┌─────────────┐      HTTP API      ┌──────────────┐
│ Node.js 代码 │  ────────────────> │ Chroma 服务端 │
│ (JS 客户端)  │   localhost:8000   │ (Python)     │
└─────────────┘                    └──────────────┘
```

- `pip install chromadb` → 装的是**服务端**，`chroma run` 启动它
- `npm install chromadb` → 装的是**JS 客户端**，被 LangChain.js 间接依赖

两者缺一不可。

---

## 三、BM25

经典的关键词检索算法，计算"文档中出现查询词的频率"来打分。

**BM25 考虑三个因素**：
- **词频**：query 里的词在文档中出现多少次
- **逆文档频率**：这个词在所有文档中有多稀有（稀有的词权重高）
- **文档长度**：长文档里出现同样的词，权重略低

对错误消息类查询特别有效，因为用户通常直接复制了文档里出现的错误文本。

---

## 四、Rerank vs 检索

| | 检索（Retrieval） | 重排序（Rerank） |
|---|---|---|
| 目的 | 快速召回候选 | 精确排序候选 |
| 速度 | 快（毫秒级） | 稍慢（百毫秒级） |
| 精度 | 中 | 高 |
| 模型 | Embedding / BM25 | 专门的 Cross-Encoder |

Rerank 模型会同时看问题和文档，做深度交互后打分，比单独看文档 Embedding 更准。

---

## 五、Parent-Child Chunking

**问题**：小 chunk 检索准，但上下文不完整；大 chunk 上下文完整，但检索不准。

**解法**：用两个不同粒度的 chunk：
- **Child（小）**：用于检索，精确匹配
- **Parent（大）**：用于生成，提供完整上下文

类比：Child 是"目录条目"，Parent 是"整章内容"。你通过目录找到章节，然后读整章。

```
原始文档（一整页）
  ├── H2 第一节 -> Parent A（完整内容）
  │   ├── 段落 1 -> Child A-1（用于检索）
  │   └── 段落 2 -> Child A-2（用于检索）
  └── H2 第二节 -> Parent B
      ├── 段落 1 -> Child B-1
      └── 段落 2 -> Child B-2
```

---

## 六、可调参数一览

### 1. 文档切分参数

**文件**：`scripts/ingest.ts`

```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,    // 每个 chunk 的最大字符数
  chunkOverlap: 50,  // 相邻 chunk 之间的重叠字符数
});
```

| 参数 | 默认值 | 调大效果 | 调小效果 |
|------|--------|---------|---------|
| `chunkSize` | 500 | 单个 chunk 包含更多上下文，但可能混入不相关内容 | chunk 更聚焦，但可能把完整概念切断 |
| `chunkOverlap` | 50 | 减少断句问题，相邻 chunk 重复更多 | 节省存储，但可能丢失上下文衔接 |

**建议**：
- 技术文档用 500~1000，保证一个 chunk 内包含完整的代码块或段落
- chunkOverlap 设为 chunkSize 的 10% 左右（如 500/50、1000/100）

---

### 2. 检索数量参数

**文件**：各 pipeline 的检索调用处

```typescript
// v0.1: 直接取 top 5
const docs = await vectorStore.similaritySearch(question, 5);

// v0.2/v0.3: Hybrid 检索取 top 20，然后 Rerank 取 top 5
const ensemble = new EnsembleRetriever({ ... });
const docs = await ensemble.invoke(question);  // 默认返回融合后的结果

// v0.3 Rerank 阶段
const reranked = await rerank(question, docs, 5);  // 从 20 个里取 top 5
```

| 参数 | 作用 | 调大效果 | 调小效果 |
|------|------|---------|---------|
| 检索阶段的 k | 召回候选数量 | 召回更多潜在相关文档，但增加噪声 | 更精准，但可能漏掉相关内容 |
| Rerank 后的 k | 最终传给 LLM 的 chunk 数 | LLM 看到更多上下文，但可能注意力分散 | 上下文更聚焦，但可能信息不足 |

**建议**：
- 检索阶段 k=20（追求"不漏"）
- Rerank 后 k=5（追求"最准"）
- 如果 LLM 的 context window 很大（如 128k），可以调到 10

---

### 3. Hybrid 检索权重

**文件**：`src/retrieval/hybrid.ts`

```typescript
new EnsembleRetriever({
  retrievers: [vectorRetriever, bm25Retriever],
  weights: [0.6, 0.4],  // 向量 : BM25
});
```

| 场景 | 推荐权重 |
|------|---------|
| 通用问题（概念、API 用法） | 0.6 : 0.4（默认） |
| 错误排查（复制了报错信息） | 0.3 : 0.7（BM25 权重更高） |
| 语义理解型问题（"怎么实现 XXX"） | 0.7 : 0.3（向量权重更高） |

---

### 4. LLM 参数

**文件**：`src/lib/llm.ts`

```typescript
new ChatOpenAI({
  model: 'deepseek-v4-pro',
  temperature: 0,      // 创造性 vs 确定性
  maxTokens: 1024,     // 最大输出长度
});
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `temperature` | 0 | 0 = 最确定，每次输出一样；调高会更有创造性，但 RAG 答案最好稳定 |
| `maxTokens` | 1024 | 根据答案长度调整。简单事实 256 就够，复杂对比可能需要 2048 |

---

### 5. Embedding 批量参数

**文件**：`src/lib/embeddings.ts`

```typescript
new DashScopeEmbeddings({
  modelName: 'text-embedding-v3',
  batchSize: 10,  // 阿里限制每次最多 10 条
});
```

**注意**：不同提供商的限制不同：
- 阿里 DashScope：batchSize <= 10
- OpenAI：batchSize <= 2048
- 调大 batchSize 可以加速 ingest，但不要超过服务商限制

---

### 6. RRF 融合常数

**文件**：`src/retrieval/hybrid.ts`（通过 `EnsembleRetriever` 内部实现）

RRF（Reciprocal Rank Fusion）公式：
```
score = sum(1 / (k + rank))
```

- `k` 默认 60，是防止高排名垄断的平滑常数
- 一般不需要调，60 是论文推荐值

---

## 七、参数调优流程

1. **先跑 eval**：用默认参数跑一遍 30 题评估，拿到 baseline 分数
2. **定位短板**：看哪个 category（factual / troubleshooting / cross-doc / evolution）分数最低
3. **针对性调参**：
   - troubleshooting 差 → 调高 BM25 权重，或增大 chunkOverlap 保留更多错误上下文
   - cross-doc 差 → 增大 chunkSize，或用 Parent-Child 切分
   - evolution 差 → 加 Rerank 或 Query Rewriting
4. **再跑 eval 验证**：确认调整有效，而不是负优化
