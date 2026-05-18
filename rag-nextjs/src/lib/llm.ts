import { ChatOpenAI } from '@langchain/openai';
import { env } from './env';

export const llm = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',
  apiKey: env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  temperature: 0,
});
