import type { LLMProvider, ProviderSelector, ProviderSelectionContext } from '@ai-robot/core';

export class SimpleProviderSelector implements ProviderSelector {
  constructor(private defaultProvider: LLMProvider) {}

  async select(_context: ProviderSelectionContext): Promise<LLMProvider> {
    return this.defaultProvider;
  }
}
