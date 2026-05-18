import { llm } from '../lib/llm';
import { ChatMessage } from '../pipelines/types';

export async function rewriteToMultiQuery(question: string): Promise<string[]> {
  const prompt = `把下面的问题改写成 3 个不同表述，用于文档检索。
保留原问题，再加 2 个改写版本（更接近文档措辞）。
直接输出 JSON 数组，无其他内容。

问题：${question}`;

  const response = await llm.invoke(prompt);
  const text = (response.content as string).trim();
  try {
    const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore parse error
  }
  return [question];
}

export async function rewriteWithHistory(
  question: string,
  history: ChatMessage[]
): Promise<string> {
  if (history.length === 0) return question;
  const historyText = history
    .slice(-4)
    .map((h) => `${h.role}: ${h.content}`)
    .join('\n');
  const prompt = `根据对话历史，把用户最新问题改写成独立完整的问题（不要依赖代词）。
直接输出改写后的问题，无其他内容。

历史：
${historyText}

最新问题：${question}`;
  const response = await llm.invoke(prompt);
  return (response.content as string).trim();
}
