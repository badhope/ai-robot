import type { LLMProvider, LLMGenerateRequest, LLMGenerateResponse } from '@ai-robot/core';
import { createLoggerWithPrefix } from '@ai-robot/logger';

const logger = createLoggerWithPrefix('OllamaProvider');

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout?: number;
}

export class OllamaProvider implements LLMProvider {
  name = 'OllamaProvider';
  kind = 'local' as const;
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.model = config.model;
    this.timeout = config.timeout || 120000;
  }

  async generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse> {
    logger.info(`Generating response with model ${this.model}`);

    const messages = this.buildMessages(input);

    const requestBody = {
      model: this.model,
      messages,
      stream: false,
      options: {
        temperature: input.temperature ?? 0.7,
        top_p: input.topP ?? 0.9,
        num_predict: input.maxTokens ?? 512,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as {
        message: { content: string };
        done: boolean;
        total_duration?: number;
        prompt_eval_count?: number;
        eval_count?: number;
      };

      return {
        provider: this.name,
        model: this.model,
        content: data.message?.content || '',
        usage: {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        raw: data,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Ollama request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        return [this.model];
      }
      const data = await response.json() as { models: Array<{ name: string }> };
      return data.models?.map(m => m.name) || [this.model];
    } catch {
      return [this.model];
    }
  }

  private buildMessages(input: LLMGenerateRequest): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }

    for (const msg of input.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    return messages;
  }
}
