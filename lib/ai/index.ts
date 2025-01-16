import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

function createProviderModel(apiIdentifier: string) {
  // Check if it starts with "anthropic:"
  if (apiIdentifier.startsWith('anthropic:')) {
    // remove "anthropic:" prefix and pass remainder to anthropic()
    const modelId = apiIdentifier.replace('anthropic:', '');
    return anthropic(modelId);
  }
  // Check if it starts with "bedrock:"
  else if (apiIdentifier.startsWith('bedrock:')) {
    // remove "bedrock:" prefix and pass remainder to bedrock()
    const modelId = apiIdentifier.replace('bedrock:', '');
    return bedrock(modelId);
  }
  // Otherwise fallback to openai
  return openai(apiIdentifier);
}

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: createProviderModel(apiIdentifier),
    middleware: customMiddleware,
  });
};

export const imageGenerationModel = openai.image('dall-e-3');