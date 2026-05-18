import { v01 } from '../src/pipelines/v01-baseline';

async function main() {
  console.log('Testing v0.1 baseline...');
  const result = await v01.ask('What is App Router in Next.js?');
  console.log('\n=== Answer ===');
  console.log(result.answer);
  console.log('\n=== Chunks ===');
  console.log(result.retrievedChunks.map((c) => ({ source: c.source, score: c.score })));
  console.log('\n=== Timings ===');
  console.log(result.timings);
}

main().catch(console.error);
