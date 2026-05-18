import { config } from 'dotenv';
config({ path: '.env.local' });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  DASHSCOPE_API_KEY: required('DASHSCOPE_API_KEY'),
  CHROMA_URL: process.env.CHROMA_URL ?? '',
  CHROMA_PATH: process.env.CHROMA_PATH ?? './data/chroma',
};
