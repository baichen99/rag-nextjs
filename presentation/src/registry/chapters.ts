import type { ChapterDef } from "./types";
import Coldopen from "../chapters/01-coldopen/Coldopen";
import { narrations as coldopenNarrations } from "../chapters/01-coldopen/narrations";
import Preview from "../chapters/02-preview/Preview";
import { narrations as previewNarrations } from "../chapters/02-preview/narrations";
import Q1Eval from "../chapters/03-q1-eval/Q1Eval";
import { narrations as q1Narrations } from "../chapters/03-q1-eval/narrations";
import Q2Hybrid from "../chapters/04-q2-hybrid/Q2Hybrid";
import { narrations as q2Narrations } from "../chapters/04-q2-hybrid/narrations";
import Q3Rerank from "../chapters/05-q3-rerank/Q3Rerank";
import { narrations as q3Narrations } from "../chapters/05-q3-rerank/narrations";
import Q4Chunking from "../chapters/06-q4-chunking/Q4Chunking";
import { narrations as q4Narrations } from "../chapters/06-q4-chunking/narrations";
import Q5Rewrite from "../chapters/07-q5-rewrite/Q5Rewrite";
import { narrations as q5Narrations } from "../chapters/07-q5-rewrite/narrations";
import Summary from "../chapters/08-summary/Summary";
import { narrations as summaryNarrations } from "../chapters/08-summary/narrations";

export const CHAPTERS: ChapterDef[] = [
  {
    id: "coldopen",
    title: "开场钩子",
    narrations: coldopenNarrations,
    Component: Coldopen,
  },
  {
    id: "preview",
    title: "整体预告",
    narrations: previewNarrations,
    Component: Preview,
  },
  {
    id: "q1-eval",
    title: "Q1: RAG 召回率怎么评估",
    narrations: q1Narrations,
    Component: Q1Eval,
  },
  {
    id: "q2-hybrid",
    title: "Q2: 怎么提升召回",
    narrations: q2Narrations,
    Component: Q2Hybrid,
  },
  {
    id: "q3-rerank",
    title: "Q3: 召回对了答案为啥还错",
    narrations: q3Narrations,
    Component: Q3Rerank,
  },
  {
    id: "q4-chunking",
    title: "Q4: 长文档怎么处理",
    narrations: q4Narrations,
    Component: Q4Chunking,
  },
  {
    id: "q5-rewrite",
    title: "Q5: 多轮对话怎么处理",
    narrations: q5Narrations,
    Component: Q5Rewrite,
  },
  {
    id: "summary",
    title: "总结",
    narrations: summaryNarrations,
    Component: Summary,
  },
];
