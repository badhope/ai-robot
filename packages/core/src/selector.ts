import type { ChatMessageEvent, IMAdapter } from './im.js';
import type { LLMProvider } from './llm.js';

export interface ProviderSelectionContext {
  event: ChatMessageEvent;
}

export interface ProviderSelector {
  select(context: ProviderSelectionContext): Promise<LLMProvider>;
}
