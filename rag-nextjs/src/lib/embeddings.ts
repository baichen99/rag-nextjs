import { OpenAIEmbeddings } from '@langchain/openai';
import { env } from './env';

export const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-v3',
  apiKey: env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
});
