import type { LLMProvider, ProviderSelector, ProviderSelectionContext } from '@ai-robot/core';

export class SimpleProviderSelector implements ProviderSelector {
  constructor(private defaultProvider: LLMProvider, private providers: Map<string, LLMProvider> = new Map()) {
    if (defaultProvider) {
      this.providers.set('default', defaultProvider);
    }
  }

  registerProvider(name: string, provider: LLMProvider): void {
    this.providers.set(name, provider);
  }

  async select(_context: ProviderSelectionContext): Promise<LLMProvider> {
    return this.defaultProvider;
  }
}
