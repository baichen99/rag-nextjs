# Next.js Docs RAG - 5 版本演进教程

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbaichen99%2Frag-nextjs)

## 一、这个项目是做什么的？

这是一个**从零开始教你构建 RAG（检索增强生成）系统**的完整项目。我们用 Next.js 官方文档做知识库，实现了 **5 个逐步优化的 RAG 版本**，并在同一个前端界面上并排对比它们的效果。

### 为什么要做这个？

很多教程只给你一个"最终版"代码，你不知道每一步优化到底带来了什么变化。这个项目让你**亲眼看到**每一次技术升级的 impact：

- 加了 BM25 混合检索后，错误类问题的准确率从 63% 提升到 100%
- 加了 Rerank 后，跨文档问题的召回率明显提升
- 加了 Parent-Child Chunking 后，答案质量提升到 80%
- 加了 Query Rewriting 后...（需要调参，也是学习的一部分）

### 最终效果

打开 `http://localhost:3000`，输入一个 Next.js 相关问题，你会看到 5 列并排的结果：

```
+----------+----------+----------+----------+----------+
|  v0.1    |  v0.2    |  v0.3    |  v0.4    |  v0.5    |
| Baseline |  Hybrid  |  Rerank  | Chunking | Rewrite  |
+----------+----------+----------+----------+----------+
| Vector   | BM25 +   | Hybrid + | Markdown | Multi-   |
|  only    | Vector   | Rerank   | Parent   | Query +  |
|          |          |          | -Child   | History  |
+----------+----------+----------+----------+----------+
```

---

## 二、技术栈选择（为什么选这些）

| 技术 | 作用 | 为什么选它 |
|------|------|-----------|
| **Next.js 16** | 全栈框架（前端 + API） | 官方最新版，App Router，开发体验好 |
| **TypeScript** | 类型安全 | 大型项目必需，减少低级错误 |
| **LangChain.js** | LLM 调用、文档处理、向量存储 | 生态成熟，抽象合理 |
| **Chroma** | 向量数据库 | 服务端用 Python 写，客户端有 npm 包；本地运行、不需要 Docker |
| **Aliyun DashScope** | LLM (DeepSeek) + Embedding + Rerank | 国内稳定、价格低、API 兼容 OpenAI 格式 |
| **Tailwind CSS** | UI 样式 | 快速构建，不用写 CSS 文件 |
| **pnpm** | 包管理 | 速度快，磁盘占用小 |

### 为什么不选其他方案？

**Q: 为什么不用 Pinecone / Weaviate / Milvus？**
> 这些都需要注册账号或 Docker。Chroma 服务端用 Python 写，pip 装一下就能本地启动；Node.js 代码通过 npm 客户端库连接，零配置、最适合教程。

**Q: 为什么不用 OpenAI API？**
> Aliyun DashScope 兼容 OpenAI 格式，但国内访问稳定，且 Embedding 和 Rerank 都是阿里自己的模型，效果不差。

**Q: EnsembleRetriever 的导入路径为什么是 `@langchain/classic`？**
> LangChain.js 在 2025-2026 年做了重构，核心包 `langchain` 只保留 agent / chat model 接口，旧的工具集（包括 EnsembleRetriever）迁到了 `@langchain/classic`。这是工业标准做法，直接使用即可：`import { EnsembleRetriever } from "@langchain/classic/retrievers/ensemble"`。

---

## 三、项目目录结构

```
rag-nextjs/
├── app/                          # Next.js App Router
│   ├── api/ask/route.ts          # API 端点：所有 pipeline 统一入口
│   ├── layout.tsx                # 根布局（字体、全局样式）
│   ├── page.tsx                  # 前端主界面：5 列对比 UI
│   └── globals.css               # Tailwind 全局样式
│
├── scripts/                      # 命令行工具
│   ├── eval.ts                   # 评估脚本：跑 30 题 eval
│   ├── fetch-docs.ts             # 拉取 Next.js 官方文档
│   └── ingest.ts                 # 将文档切分并写入 Chroma
│
├── src/                          # 核心源码
│   ├── chunking/
│   │   └── markdown-aware.ts     # Markdown 感知切分 + Parent-Child
│   ├── eval/
│   │   ├── dataset.ts            # 30 题评估集（含预期答案和关键词）
│   │   └── metrics.ts            # Recall@5 + Answer Accuracy 计算
│   ├── lib/
│   │   ├── chroma.ts             # Chroma 连接封装
│   │   ├── embeddings.ts         # Aliyun Embedding API（text-embedding-v3）
│   │   ├── env.ts                # 环境变量集中管理
│   │   └── llm.ts                # Aliyun LLM API（deepseek-v4-pro）
│   ├── pipelines/
│   │   ├── types.ts              # Pipeline 接口定义
│   │   ├── v01-baseline.ts       # v0.1：纯向量检索
│   │   ├── v02-hybrid.ts         # v0.2：BM25 + Vector 混合
│   │   ├── v03-rerank.ts         # v0.3：Hybrid + Rerank
│   │   ├── v04-chunking.ts       # v0.4：Markdown Chunking + Parent-Child
│   │   └── v05-query-rewrite.ts  # v0.5：Multi-Query + History-Aware
│   ├── query-rewriting/
│   │   └── multi-query.ts        # Query 改写实现
│   ├── reranking/
│   │   └── dashscope.ts          # Aliyun Rerank API（gte-rerank）
│   └── retrieval/
│       └── hybrid.ts             # BM25 + Vector EnsembleRetriever 混合检索
│
├── data/                         # 数据目录（.gitignore 排除）
│   ├── chunks-fixed.json         # Fixed-size 切分结果
│   ├── chunks-markdown.json      # Markdown-aware 切分结果
│   ├── parents-markdown.json     # Parent 文档映射
│   ├── chroma/                   # Chroma 本地持久化数据
│   ├── eval-results/             # 评估结果 JSON
│   └── nextjs-docs/              # 拉取的原始文档
│
├── .env.local                    # API Key 等敏感配置
├── package.json
└── next.config.ts
```

---

## 四、环境准备（0 基础版）

### 第 1 步：安装 Node.js

项目需要 Node.js 18+，推荐 20+。

```bash
# 检查版本
node -v

# 如果版本太老，去 https://nodejs.org 下载 LTS 版
# 或者用 nvm 安装：
nvm install 20
nvm use 20
```

### 第 2 步：安装 pnpm

```bash
npm install -g pnpm
```

### 第 3 步：安装 Python（Chroma 需要）

Chroma 服务端是 Python 写的，需要 Python 3.9+：

```bash
# 检查版本
python3 -V

# macOS 自带，如果没有：
brew install python3
```

### 第 4 步：克隆项目并安装依赖

```bash
git clone <项目地址>
cd rag-nextjs
pnpm install
```

### 第 5 步：配置 API Key

在项目根目录创建 `.env.local`：

```bash
# Aliyun DashScope API Key
# 去 https://dashscope.aliyun.com 注册并获取
DASHSCOPE_API_KEY=sk-your-key-here
```

### 第 6 步：启动 Chroma 服务端

```bash
# 创建 Python 虚拟环境
python3 -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate     # Windows

# 安装 Chroma
pip install chromadb

# 启动服务（数据持久化到 data/chroma/）
chroma run --path ./data/chroma

# 应该看到：
# 2024-... chroma_server: Chroma API running on http://localhost:8000
```

> 保持这个终端窗口运行！Chroma 服务端必须一直开着。

---

## 五、运行项目

### 方式 1：启动前端（最常用）

```bash
# 新终端窗口
pnpm dev
```

打开 http://localhost:3000，输入问题即可看到 5 列对比结果。

### 方式 2：测试单个 Pipeline

```bash
# 测试 v0.1
npx tsx -e "
import { v01 } from './src/pipelines/v01-baseline';
const r = await v01.ask('What hook reads pathname in App Router?');
console.log(r.answer);
"
```

### 方式 3：跑完整评估

```bash
# 评估 v0.1（30 题，约 6 分钟）
pnpm eval v0.1

# 评估其他版本
pnpm eval v0.2
pnpm eval v0.3
pnpm eval v0.4
pnpm eval v0.5

# 结果保存在 data/eval-results/
```

---

## 六、5 个版本的详细讲解

### v0.1 Baseline - 纯向量检索

**做了什么**：用 Embedding 把问题和文档都变成向量，在 Chroma 里做相似度搜索，取 top 5 传给 LLM 生成答案。

**代码核心**：
```typescript
// 1. 向量化问题
const docs = await vectorStore.similaritySearch(question, 5);

// 2. 拼 prompt
const context = docs.map(d => d.pageContent).join('\n\n');
const prompt = `根据文档回答问题：\n${context}\n\n问题：${question}`;

// 3. LLM 生成答案
const answer = await llm.invoke(prompt);
```

**优点**：简单直接，对语义匹配好的问题效果不错。

**缺点**：
- 对错误类问题（如"hydration failed"）召回率差，因为错误消息和文档内容的语义空间不同
- 切分粒度固定，可能把相关上下文切到不同 chunk 里
- 没有重排序，top 5 不一定是最好的 5 个

**评估结果**：Recall@5 = 48.3%，Answer Acc = 63.3%

---

### v0.2 Hybrid - BM25 + 向量混合检索

**做了什么**：同时用向量检索和 BM25 关键词检索，然后用 RRF 算法融合两者的结果。

**为什么需要**：
- 向量检索擅长语义匹配（"怎么读取路径" -> "usePathname"）
- BM25 擅长关键词匹配（"hydration failed" 直接命中文档中的错误标题）
- 两者互补，提高召回率

**RRF 融合公式**：
```
score = sum(1 / (k + rank))

k = 60（常数，防止高排名垄断）
rank = 在单个检索器中的排名（从 0 开始）
```

简单说：每个检索器给文档一个排名分数，加起来总分最高的胜出。

**代码核心**：
```typescript
import { EnsembleRetriever } from "@langchain/classic/retrievers/ensemble";

const ensemble = new EnsembleRetriever({
  retrievers: [vectorRetriever, bm25Retriever],
  weights: [0.6, 0.4],
});

const docs = await ensemble.invoke(question);
```

**评估结果**：Recall@5 = 50.0%，Answer Acc = 73.3%

**关键提升**：troubleshooting 类问题准确率从 63% -> 100%，BM25 对错误关键词的匹配是杀手锏。

---

### v0.3 Rerank - 重排序

**做了什么**：先召回更多文档（top 20），然后用专门的 Rerank 模型重新打分，取 top 5。

**为什么需要**：
- 检索阶段追求"不漏"，所以需要更大的 k（如 20）
- 但 top 20 里的排序不一定精准
- Rerank 模型（如阿里的 gte-rerank）专门做"问题和文档的相关性打分"，比向量相似度更准

**流程**：
```
问题 -> Hybrid 检索 top 20 -> Rerank 打分 -> 取 top 5 -> LLM 生成
```

**代码核心**：
```typescript
// 1. 召回 20 个
const docs = await hybridRetrieve(store, question, 20);

// 2. Rerank
const reranked = await rerank(question, docs.map(d => ({
  content: d.pageContent,
  source: d.metadata.source,
})), 5);
```

**评估结果**：Recall@5 = 56.7%，Answer Acc = 73.3%

**关键提升**：跨文档类问题的召回率提升明显，Rerank 能更好地识别哪些 chunk 真正相关。

---

### v0.4 Chunking - Markdown 感知切分 + Parent-Child

**做了什么**：
1. **Markdown 感知切分**：按 H2 标题切分文档，保证每个 chunk 是一个完整的小节
2. **Parent-Child**：Child chunk 用于检索（小粒度，精确匹配），Parent chunk 用于生成（大粒度，完整上下文）

**为什么需要**：
- 固定 500 字符切分会把一个完整的概念切成两半
- "Server Component 的工作方式"这个主题可能横跨 3 个固定 chunk，导致检索时只召回片段
- Parent-Child 保证：检索到小节 -> 使用完整大节作为上下文 -> LLM 能看到完整解释

**切分策略**：
```
原始文档（一整页）
  ├── H2 第一节 -> Parent A（完整内容）
  │   ├── 段落 1 -> Child A-1（用于检索）
  │   └── 段落 2 -> Child A-2（用于检索）
  └── H2 第二节 -> Parent B
      ├── 段落 1 -> Child B-1
      └── 段落 2 -> Child B-2
```

**代码核心**：
```typescript
// 检索到 child chunks
const hybridRetriever = buildHybridRetriever(store, 20, 'data/chunks-markdown.json');
const childDocs = await hybridRetriever.invoke(question);

// 用 parent content 去重并生成
const parentContents = [];
for (const doc of childDocs) {
  const parentId = doc.metadata.parentId;
  if (!seenParents.has(parentId)) {
    const parent = parentMap.get(parentId);
    parentContents.push(parent.content);
  }
}
```

**评估结果**：Recall@5 = 50.0%，Answer Acc = **80.0%**

**关键提升**：答案准确率最高！Parent 提供的完整上下文让 LLM 能给出更完整、更准确的答案。

---

### v0.5 Query Rewrite - Multi-Query + History-Aware

**做了什么**：
1. **History-Aware**：如果有对话历史，把问题改写成"结合上下文的完整问题"
2. **Multi-Query**：把一个问题改写成多个语义变体，分别检索，合并结果

**为什么需要**：
- 用户的 follow-up 问题常常依赖上下文（"How is it different?" -> 必须知道"different from what"）
- 单个 query 可能用词不当，多个变体能覆盖更多相关文档

**流程**：
```
用户问题 -> History-Aware 改写 -> Multi-Query 变体
                                      |
                    query A -> 检索 ->|
                    query B -> 检索 -> 合并去重 -> Rerank -> LLM
                    query C -> 检索 ->|
```

**代码核心**：
```typescript
// 1. 结合历史改写
const rewrittenQuestion = await rewriteWithHistory(question, history);

// 2. 生成多查询
const queries = await rewriteToMultiQuery(rewrittenQuestion);
// queries = [原问题, 变体1, 变体2]

// 3. 每个查询检索
for (const q of queries) {
  const hybridRetriever = buildHybridRetriever(store, 10, 'data/chunks-markdown.json');
  const docs = await hybridRetriever.invoke(q);
  // 合并去重...
}
```

**评估结果**：Recall@5 = 40.0%，Answer Acc = 60.0%

**当前问题**：Multi-Query 引入了噪声，部分改写 query 召回了不相关文档。这是预期中的——Query Rewriting 的 trade-off 就是"覆盖更多 vs 引入噪声"。

**调参方向**：
- 只对 evolution 类问题启用 multi-query
- 降低 multi-query 数量（2 个而不是 3 个）
- 增加 query 质量过滤（去掉和原问题相似度太低的变体）

---

## 七、核心概念与参数

基础概念（Embedding、BM25、Rerank、Parent-Child 等）和全部可调参数（chunk size、weights、temperature 等）的详细讲解，见 [CONCEPTS.md](./CONCEPTS.md)。

---

## 八、如何扩展和修改

### 添加第 6 个版本

1. 创建 `src/pipelines/v06-xxx.ts`：
```typescript
import { Pipeline, PipelineResult } from './types';

export const v06: Pipeline = {
  version: 'v0.6',
  name: 'Your Idea',
  description: '简短描述',

  async ask(question, history): Promise<PipelineResult> {
    // 你的实现...
    return {
      answer: '...',
      retrievedChunks: [...],
      timings: { retrieval: 0, generation: 0, total: 0 },
    };
  },
};
```

2. 在 `app/api/ask/route.ts` 中导入并注册：
```typescript
import { v06 } from '@/src/pipelines/v06-xxx';

const pipelines = {
  'v0.1': v01, ..., 'v0.6': v06,
};
```

3. 在 `app/page.tsx` 的 `VERSIONS` 数组中添加：
```typescript
const VERSIONS = [
  ..., 
  { id: "v0.6", name: "Your Idea", desc: "...", color: "bg-pink-500" },
];
```

### 调整切分参数

在 `scripts/ingest.ts` 中修改：
```typescript
// 固定大小切分
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,    // 改大 -> chunk 更大，上下文更多
  chunkOverlap: 50,  // 改大 -> chunk 之间重复更多，减少断句问题
});
```

### 调整 Rerank 数量

在 `src/pipelines/v03-rerank.ts` 中：
```typescript
// 先召回 20 个，rerank 后取 5 个
const docs = await hybridRetrieve(store, question, 20);  // <- 改这里
const reranked = await rerank(question, ..., 5);         // <- 改这里
```

### 使用不同的 Embedding 模型

在 `src/lib/embeddings.ts` 中修改 model 名称：
```typescript
export const embeddings = new DashScopeEmbeddings({
  modelName: 'text-embedding-v3',  // <- 改成其他模型
  apiKey: env.DASHSCOPE_API_KEY,
  batchSize: 10,
});
```

### 使用不同的 LLM

在 `src/lib/llm.ts` 中修改：
```typescript
export const llm = new ChatOpenAI({
  model: 'deepseek-v4-pro',  // <- 改成 qwen-plus、gpt-4 等
  temperature: 0,
  maxTokens: 1024,
});
```

---

## 九、常见问题 FAQ

### Q1: Chroma 不是有 npm 包吗？为什么还需要 pip 安装？

**一句话：npm 包装的是客户端，pip 安装的是服务端，两者缺一不可。**

Chroma 的架构是 C/S 模式：

| | `pip install chromadb` | `npm install chromadb` |
|---|---|---|
| 角色 | **服务端**（Python 写的） | **客户端**（JS HTTP 调用库） |
| 功能 | `chroma run` 启动本地 HTTP 服务 | 从 Node.js 代码发 HTTP 请求连接服务端 |
| 项目中 | 必需，没有它就没有数据库服务 | 已装在 `node_modules`，被 LangChain.js 间接依赖 |

流程：
```
Node.js 代码 —(HTTP)—> Chroma 服务端(Python, localhost:8000) —(本地文件)—> data/chroma/
```

LangChain.js 的 `Chroma` 类只负责发 HTTP 请求，实际存储、索引、向量计算都在 Python 服务端完成。

### Q2: Chroma 启动失败 / 端口被占用

```bash
# 检查 8000 端口是否被占用
lsof -i :8000

# 如果被占用，杀掉进程或换端口
chroma run --path ./data/chroma --port 8001

# 同时修改 .env.local
CHROMA_URL=http://localhost:8001
```

### Q2: API Key 报错 "Invalid API Key"

1. 确认 `.env.local` 文件存在且格式正确
2. 确认 key 没有多余空格
3. 确认使用的是 Aliyun DashScope 的 key，不是 OpenAI 的

### Q3: Ingest 时 Embedding API 报错

阿里的 Embedding API 一次最多支持 10 条，代码里已经设置了 `batchSize: 10`。如果还报错，可能是：
- API Key 额度用完
- 网络问题（重试即可）

### Q4: 前端显示 "Error: unknown version"

检查 `app/api/ask/route.ts` 里的 `pipelines` 对象是否包含你要调用的版本。

### Q5: Recall@5 为什么不高？

Recall@5 要求检索结果的 source 路径和 expectedSources 完全匹配。可能的原因：
1. 向量检索没召回正确文档（正常，尤其是 baseline）
2. expectedSources 路径写错（文档目录结构可能随 Next.js 版本变化）
3. 答案 accuracy 和 recall 是两个独立指标，recall 低不代表答案错

### Q6: 我想用 Docker 跑 Chroma

```bash
docker run -p 8000:8000 -v ./data/chroma:/chroma/chroma chromadb/chroma:latest
```

然后修改 `CHROMA_URL=http://localhost:8000`（如果改端口也要同步改）。

### Q7: 如何更新 Next.js 文档？

```bash
# 重新拉取最新文档
pnpm fetch-docs

# 重新 ingest
pnpm ingest
```

注意：文档目录结构可能变化，需要人工检查 `src/eval/dataset.ts` 里的 `expectedSources` 是否还正确。

### Q8: pnpm eval 太慢了，能加速吗？

可以去掉 `scripts/eval.ts` 里的 `sleep(500)` 来减少等待时间。但如果触发 API 限流会报错，需要自行平衡。

---

## 十、学习路径建议

如果你是 RAG 新手，建议按这个顺序学习：

1. **先跑通 v0.1**：理解向量检索的基本流程
2. **对比 v0.1 和 v0.2**：体会 BM25 对关键词匹配的强大
3. **对比 v0.2 和 v0.3**：理解 Rerank 的价值（top 20 -> top 5 的精确筛选）
4. **看 v0.4 的答案**：体会 Parent-Child 带来的答案质量提升
5. **研究 v0.5 的问题**：理解 Query Rewriting 的 trade-off，思考如何改进
6. **自己实现 v0.6**：比如加 HyDE（Hypothetical Document Embedding）、加查询分类器、用更高级的 Rerank 模型

---

## 十一、参考资源

- [LangChain.js 文档](https://js.langchain.com/)
- [Chroma 文档](https://docs.trychroma.com/)
- [DashScope 文档](https://help.aliyun.com/document_detail/611472.html)
- [RRF 论文](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
- [Next.js 官方文档](https://nextjs.org/docs)
