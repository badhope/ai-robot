export interface LLMGenerateRequest {
  model?: string;
  systemPrompt?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface LLMGenerateResponse {
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
}

export interface LLMProvider {
  name: string;
  kind: 'local' | 'remote' | 'experimental';
  generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse>;
  healthCheck(): Promise<boolean>;
  listModels?(): Promise<string[]>;
}
