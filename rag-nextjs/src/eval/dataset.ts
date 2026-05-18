//
// 30 个评估问题,用于跑 v0.1 ~ v0.5 的对比评估。
//
// 设计原则:
// 1. 每题答案在 Next.js 官方文档里真实存在(基于 App Router 当前文档)
// 2. expectedSources 写文件路径,用于 Recall@k 评估
// 3. expectedKeywords 用 "必然出现的核心词",大小写不敏感匹配
// 4. 实习生跑完 fetch-docs 后,需要人工核对 expectedSources 的真实路径
//    (Vercel 偶尔调整目录,以实际拉下来的为准)

export type EvalCategory = 'factual' | 'troubleshooting' | 'cross-doc' | 'evolution';

export interface EvalQuestion {
  id: string;
  question: string;
  category: EvalCategory;
  expectedSources: string[];       // 命中其中一个就算 recall 成功
  expectedKeywords: string[];      // 大小写不敏感,匹配 >=50% 算答对
  /** 用于 follow-up 问题,如果有前置对话 */
  history?: { role: 'user' | 'assistant'; content: string }[];
  /** 给视频里讲解时的备注,不参与评估 */
  note?: string;
}

export const EVAL_SET: EvalQuestion[] = [
  // ============================================================
  // 类别 1: factual 事实型 (8 题)
  // 基线题,v0.1 baseline 也应该能答对一半以上
  // 用来证明: "Hybrid/Rerank 不是因为 baseline 太烂才显得好"
  // ============================================================
  {
    id: 'f01',
    question: 'In the App Router, are components Server Components by default?',
    category: 'factual',
    expectedSources: [
      '01-app/01-getting-started/05-server-and-client-components.mdx',
    ],
    expectedKeywords: ['Server Component', 'default'],
    note: 'App Router 默认 Server Component',
  },
  {
    id: 'f02',
    question: 'What is the file name convention for a layout in the App Router?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/layout.mdx',
    ],
    expectedKeywords: ['layout.js', 'layout.tsx'],
    note: '答案就是 layout.tsx / layout.js',
  },
  {
    id: 'f03',
    question: 'Which directive marks a component as a Client Component?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/01-directives/use-client.mdx',
    ],
    expectedKeywords: ['use client', 'directive'],
    note: '答案是 "use client" 字符串',
  },
  {
    id: 'f04',
    question: 'What hook do you use to read the current pathname in App Router?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/04-functions/use-pathname.mdx',
    ],
    expectedKeywords: ['usePathname', 'next/navigation'],
  },
  {
    id: 'f05',
    question: 'How do you define dynamic route segments in the App Router file structure?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/dynamic-routes.mdx',
    ],
    expectedKeywords: ['[', ']', 'dynamic'],
    note: '答案是 [id] 这种方括号语法',
  },
  {
    id: 'f06',
    question: 'What is the purpose of the not-found.js file?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/not-found.mdx',
    ],
    expectedKeywords: ['not found', '404'],
  },
  {
    id: 'f07',
    question: 'How can you opt out of static rendering for a route?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/02-route-segment-config/index.mdx',
    ],
    expectedKeywords: ['dynamic', 'force-dynamic'],
    note: 'export const dynamic = "force-dynamic"',
  },
  {
    id: 'f08',
    question: 'What function do you use in App Router to redirect from a Server Component?',
    category: 'factual',
    expectedSources: [
      '01-app/03-api-reference/04-functions/redirect.mdx',
    ],
    expectedKeywords: ['redirect', 'next/navigation'],
  },

  // ============================================================
  // 类别 2: troubleshooting 故障型 (7 题)
  // 用户用关键词描述错误,语义检索常常召回不到
  // BM25 关键词匹配在这类问题上是杀手锏
  // ============================================================
  {
    id: 't01',
    question: 'I got error "You\'re importing a component that needs useState. It only works in a Client Component but none of its parents are marked with use client".',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/01-getting-started/05-server-and-client-components.mdx',
    ],
    expectedKeywords: ['use client', 'Client Component'],
    note: '典型 hooks 在 Server Component 里用的报错',
  },
  {
    id: 't02',
    question: 'Error: Hydration failed because the initial UI does not match what was rendered on the server',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/01-getting-started/05-server-and-client-components.mdx',
    ],
    expectedKeywords: ['hydration', 'mismatch'],
    note: 'hydration mismatch 经典报错',
  },
  {
    id: 't03',
    question: 'Why does my page not show fresh data even after the database is updated?',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/01-getting-started/08-caching.mdx',
    ],
    expectedKeywords: ['cache', 'revalidate'],
    note: 'Next.js 默认缓存的坑',
  },
  {
    id: 't04',
    question: 'Error: Module not found: Can\'t resolve "fs" when importing a server-only package',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/01-getting-started/05-server-and-client-components.mdx',
    ],
    expectedKeywords: ['server-only', 'fs'],
  },
  {
    id: 't05',
    question: 'How to fix "Dynamic server usage: cookies" error during static rendering?',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/03-api-reference/04-functions/cookies.mdx',
    ],
    expectedKeywords: ['cookies', 'dynamic'],
  },
  {
    id: 't06',
    question: 'My middleware is not running on certain paths, what could be wrong?',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/middleware.mdx',
    ],
    expectedKeywords: ['middleware', 'matcher'],
  },
  {
    id: 't07',
    question: 'Image component throws "Invalid src prop, hostname is not configured under images in your next.config.js"',
    category: 'troubleshooting',
    expectedSources: [
      '01-app/03-api-reference/02-components/image.mdx',
    ],
    expectedKeywords: ['remotePatterns', 'next.config'],
  },

  // ============================================================
  // 类别 3: cross-doc 跨文档/需要完整章节 (8 题)
  // 答案散在多个 chunks 或需要整个 section 的上下文
  // Parent-Child Chunking (v0.4) 的优势主要靠这一类体现
  // ============================================================
  {
    id: 'c01',
    question: 'Explain the relationship between layout.tsx and template.tsx and when to use which.',
    category: 'cross-doc',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/layout.mdx',
      '01-app/03-api-reference/03-file-conventions/template.mdx',
    ],
    expectedKeywords: ['layout', 'template', 're-render'],
    note: 'layout 持久化,template 每次 navigate 重建',
  },
  {
    id: 'c02',
    question: 'How does data caching work together with full route caching in Next.js?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/01-getting-started/08-caching.mdx',
    ],
    expectedKeywords: ['Data Cache', 'Full Route Cache', 'revalidate'],
    note: '需要 caching 整章上下文',
  },
  {
    id: 'c03',
    question: 'What is the difference between generateStaticParams and getStaticPaths?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/03-api-reference/04-functions/generate-static-params.mdx',
    ],
    expectedKeywords: ['generateStaticParams', 'getStaticPaths', 'App Router', 'Pages Router'],
  },
  {
    id: 'c04',
    question: 'How do Server Actions interact with revalidation and where should they be defined?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/01-getting-started/07-mutating-data.mdx',
    ],
    expectedKeywords: ['Server Action', 'use server', 'revalidate'],
  },
  {
    id: 'c05',
    question: 'How do you stream UI from the server using Suspense and loading.js together?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/loading.mdx',
    ],
    expectedKeywords: ['Suspense', 'loading.js', 'stream'],
  },
  {
    id: 'c06',
    question: 'Compare the behavior of fetch() in Server Components vs Client Components.',
    category: 'cross-doc',
    expectedSources: [
      '01-app/01-getting-started/06-fetching-data.mdx',
    ],
    expectedKeywords: ['fetch', 'Server Component', 'Client Component'],
  },
  {
    id: 'c07',
    question: 'What are parallel routes and how do they work with intercepting routes?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/parallel-routes.mdx',
      '01-app/03-api-reference/03-file-conventions/intercepting-routes.mdx',
    ],
    expectedKeywords: ['parallel', 'intercepting', '@', '(.)'],
  },
  {
    id: 'c08',
    question: 'How does Middleware execution order relate to redirects, rewrites, and the matcher config?',
    category: 'cross-doc',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/middleware.mdx',
    ],
    expectedKeywords: ['middleware', 'matcher', 'redirect'],
  },

  // ============================================================
  // 类别 4: evolution 演化/易混型 (7 题)
  // App Router vs Pages Router 答案完全不同的题
  // 这是项目最关键的题型 —— Reranker 和 Query Rewriting 的提升主要看这里
  // ============================================================
  {
    id: 'e01',
    question: 'How do you do server-side data fetching in Next.js?',
    category: 'evolution',
    expectedSources: [
      '01-app/01-getting-started/06-fetching-data.mdx',
    ],
    expectedKeywords: ['Server Component', 'fetch', 'async'],
    note: 'Pages Router 答案是 getServerSideProps,App Router 是 Server Component 里 async fetch。问题没指定 router,baseline 容易混淆',
  },
  {
    id: 'e02',
    question: 'How do I create an API endpoint in Next.js?',
    category: 'evolution',
    expectedSources: [
      '01-app/01-getting-started/15-route-handlers.mdx',
    ],
    expectedKeywords: ['route.ts', 'Route Handler'],
    note: 'Pages 是 pages/api/*.ts,App 是 app/.../route.ts;问题不明确,容易召回错',
  },
  {
    id: 'e03',
    question: 'How do I share layout between pages?',
    category: 'evolution',
    expectedSources: [
      '01-app/03-api-reference/03-file-conventions/layout.mdx',
    ],
    expectedKeywords: ['layout.tsx', 'children'],
    note: 'Pages Router 用 _app.tsx + getLayout,App Router 用 layout.tsx',
  },
  {
    id: 'e04',
    question: 'Where do I configure global CSS in Next.js?',
    category: 'evolution',
    expectedSources: [
      '01-app/02-guides/migrating/app-router-migration.mdx',
    ],
    expectedKeywords: ['globals.css', 'layout', 'import'],
    note: 'Pages 是 _app.tsx,App 是 root layout',
  },
  {
    id: 'e05',
    question: 'How do I dynamically generate metadata like the page title?',
    category: 'evolution',
    expectedSources: [
      '01-app/03-api-reference/04-functions/generate-metadata.mdx',
    ],
    expectedKeywords: ['generateMetadata', 'export'],
    note: 'Pages 用 next/head,App 用 generateMetadata',
  },
  {
    id: 'e06',
    question: 'How do I redirect a user after form submission?',
    category: 'evolution',
    expectedSources: [
      '01-app/03-api-reference/04-functions/redirect.mdx',
    ],
    expectedKeywords: ['redirect', 'next/navigation'],
    note: 'Pages 用 router.push,App 用 redirect() from next/navigation。BM25 + Rerank 的强项',
  },
  {
    id: 'e07',
    // 这题用 follow-up 形式,专门考 v0.5 history-aware rewriting
    question: 'How is it different from Pages Router?',
    category: 'evolution',
    expectedSources: [
      '01-app/01-getting-started/05-server-and-client-components.mdx',
    ],
    expectedKeywords: ['App Router', 'Pages Router'],
    history: [
      { role: 'user', content: 'What is the default rendering mode in App Router?' },
      { role: 'assistant', content: 'In the App Router, components are Server Components by default, which means they render on the server.' },
    ],
    note: '只看最后一个问题完全答不上,必须靠 history-aware rewriting 改写成"App Router 默认渲染跟 Pages Router 有啥区别"',
  },
];

// 一些校验,导入时跑一次,避免数据写歪
function validate() {
  if (EVAL_SET.length !== 30) {
    throw new Error(`Expected 30 questions, got ${EVAL_SET.length}`);
  }
  const ids = new Set(EVAL_SET.map(q => q.id));
  if (ids.size !== 30) throw new Error('Duplicate IDs in EVAL_SET');

  const counts: Record<EvalCategory, number> = {
    factual: 0, troubleshooting: 0, 'cross-doc': 0, evolution: 0,
  };
  for (const q of EVAL_SET) counts[q.category]++;
  // 8 + 7 + 8 + 7 = 30
  if (counts.factual !== 8 || counts.troubleshooting !== 7 ||
      counts['cross-doc'] !== 8 || counts.evolution !== 7) {
    throw new Error('Category distribution mismatch: ' + JSON.stringify(counts));
  }
}
validate();
