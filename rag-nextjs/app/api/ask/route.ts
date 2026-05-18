import { NextRequest, NextResponse } from 'next/server';
import { v01 } from '@/src/pipelines/v01-baseline';
import { v02 } from '@/src/pipelines/v02-hybrid';
import { v03 } from '@/src/pipelines/v03-rerank';
import { v04 } from '@/src/pipelines/v04-chunking';
import { v05 } from '@/src/pipelines/v05-query-rewrite';

const pipelines = {
  'v0.1': v01,
  'v0.2': v02,
  'v0.3': v03,
  'v0.4': v04,
  'v0.5': v05,
};

export async function POST(req: NextRequest) {
  const { question, version, history } = await req.json();
  const pipeline = pipelines[version as keyof typeof pipelines];
  if (!pipeline) {
    return NextResponse.json({ error: 'unknown version' }, { status: 400 });
  }
  try {
    const result = await pipeline.ask(question, history);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
