import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TARGET = path.resolve('data/nextjs-docs');

if (fs.existsSync(TARGET)) {
  console.log('docs already fetched, skip');
  process.exit(0);
}

const tmpDir = path.resolve('.tmp-nextjs');

if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

execSync(`git clone --depth 1 https://github.com/vercel/next.js.git ${tmpDir}`, {
  stdio: 'inherit',
});

fs.mkdirSync('data', { recursive: true });
fs.renameSync(path.join(tmpDir, 'docs'), TARGET);
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('done');
