export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RetrievedChunk {
  content: string;
  source: string;
  score?: number;
  rerankScore?: number;
}

export interface PipelineResult {
  answer: string;
  retrievedChunks: RetrievedChunk[];
  rewrittenQueries?: string[];
  timings: {
    retrieval: number;
    rerank?: number;
    generation: number;
    total: number;
  };
}

export interface Pipeline {
  version: 'v0.1' | 'v0.2' | 'v0.3' | 'v0.4' | 'v0.5';
  name: string;
  description: string;
  ask(question: string, history?: ChatMessage[]): Promise<PipelineResult>;
}
