// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
    // Amazon Bedrock
    {
      id: 'bedrock:anthropic.claude-3-haiku-20240307-v1:0',
      label: 'Bedrock - Claude 3 Haiku',
      apiIdentifier: 'bedrock:anthropic.claude-3-haiku-20240307-v1:0',
      description: 'Anthropic Claude on Amazon Bedrock with Haiku 3 variant',
    },
    {
      id: 'bedrock:anthropic.claude-3-5-haiku-20241022-v1:0',
      label: 'Bedrock - Claude 3.5 Haiku',
      apiIdentifier: 'bedrock:anthropic.claude-3-5-haiku-20241022-v1:0',
      description: 'Anthropic Claude on Amazon Bedrock with Haiku 3.5 variant',
    },
    
    {
      id: 'bedrock:anthropic.claude-3-5-sonnet-20241022-v2:0',
      label: 'Bedrock - Claude 3.5 Sonnet V2',
      apiIdentifier: 'bedrock:anthropic.claude-3-5-sonnet-20241022-v2:0',
      description: 'Anthropic Claude on Amazon Bedrock with Sonnet variant',
    },
  {
    id: 'gpt-4o-mini',
    label: 'OpenAI - GPT 4o mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gpt-4o',
    label: 'OpenAI - GPT 4o',
    apiIdentifier: 'gpt-4o',
    description: 'For complex, multi-step tasks',
  },

  // Anthropic
  {
    id: 'anthropic:claude-3-5-haiku-20241022',
    label: 'Anthropic - Claude 3.5 Haiku',
    apiIdentifier: 'anthropic:claude-3-5-haiku-20241022',
    description: 'Anthropic’s faster Claude model for simpler tasks',
  },
  {
    id: 'anthropic:claude-3-5-sonnet-20241022',
    label: 'Anthropic - Claude 3.5 Sonnet V2)',
    apiIdentifier: 'anthropic:claude-3-5-sonnet-20241022',
    description: 'Anthropic’s advanced Claude model for complex tasks',
  },
  


] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';