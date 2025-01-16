# OpenAI Provider

The OpenAI provider offers comprehensive support for OpenAI's language models through chat and completion APIs, along with embedding model support via the OpenAI embeddings API.

## Setup

Install the OpenAI provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/openai

# Using npm
npm install @ai-sdk/openai

# Using yarn
yarn add @ai-sdk/openai
```

## Provider Instance

Import the default provider instance:

```javascript
import { openai } from '@ai-sdk/openai';
```

For custom configurations, create a provider instance with specific settings:

```javascript
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});
```

### Configuration Options

- `baseURL` (string): Custom URL prefix for API calls. Default: https://api.openai.com/v1
- `apiKey` (string): API key for Authorization header. Default: OPENAI_API_KEY environment variable
- `name` (string): Provider name. Default: openai
- `organization` (string): OpenAI Organization
- `project` (string): OpenAI project
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation
- `compatibility` ("strict" | "compatible"): OpenAI compatibility mode

## Language Models

Create a language model instance:

```javascript
const model = openai('gpt-4-turbo');

// With additional settings
const modelWithSettings = openai('gpt-4-turbo', {
  // additional settings
});
```

### Example Usage

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## Chat Models

Create chat API models using the `.chat()` method:

```javascript
const model = openai.chat('gpt-3.5-turbo');

// With additional settings
const modelWithOptions = openai.chat('gpt-3.5-turbo', {
  logitBias: {
    '50256': -100,
  },
  user: 'test-user',
});
```

### Chat Model Options

- `logitBias` (Record<number, number>): Modify token likelihood
- `logProbs` (boolean | number): Return token log probabilities
- `parallelToolCalls` (boolean): Enable parallel function calling
- `useLegacyFunctionCalls` (boolean): Use legacy function calling
- `structuredOutputs` (boolean): Enable structured outputs
- `user` (string): Unique end-user identifier
- `downloadImages` (boolean): Auto-download images for private models
- `simulateStreaming` (boolean): Simulate streaming for non-streaming models
- `reasoningEffort` ('low' | 'medium' | 'high'): Set reasoning effort level

## Structured Outputs

Enable structured outputs for schema-conformant generation:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4o-2024-08-06', {
    structuredOutputs: true,
  }),
  schemaName: 'recipe',
  schemaDescription: 'A recipe for lasagna.',
  schema: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      }),
    ),
    steps: z.array(z.string()),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

## Predicted Outputs

Enable predicted outputs for reduced latency:

```javascript
const result = streamText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: 'Replace the Username property with an Email property.',
    },
    {
      role: 'user',
      content: existingCode,
    },
  ],
  experimental_providerMetadata: {
    openai: {
      prediction: {
        type: 'content',
        content: existingCode,
      },
    },
  },
});

// Access prediction metadata
const openaiMetadata = (await result.experimental_providerMetadata)?.openai;
const acceptedPredictionTokens = openaiMetadata?.acceptedPredictionTokens;
const rejectedPredictionTokens = openaiMetadata?.rejectedPredictionTokens;
```

## Image Detail

Set image generation detail level:

```javascript
const result = await generateText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail.' },
        {
          type: 'image',
          image: 'https://example.com/image.png',
          experimental_providerMetadata: {
            openai: { imageDetail: 'low' },
          },
        },
      ],
    },
  ],
});
```

## Distillation

Store generations for later use in the distillation process:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import 'dotenv/config';

async function main() {
  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: 'Who worked on the original macintosh?',
    experimental_providerMetadata: {
      openai: {
        store: true,
        metadata: {
          custom: 'value',
        },
      },
    },
  });

  console.log(text);
  console.log('Usage:', usage);
}
```

## Reasoning Models

OpenAI's o1 series of reasoning models (o1, o1-mini, and o1-preview) support additional settings and response metadata:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text, usage, experimental_providerMetadata } = await generateText({
  model: openai('o1-mini'),
  prompt: 'Invent a new holiday and describe its traditions.',
  experimental_providerMetadata: {
    openai: {
      reasoningEffort: 'low',
    },
  },
});

console.log(text);
console.log('Usage:', {
  ...usage,
  reasoningTokens: experimental_providerMetadata?.openai?.reasoningTokens,
});
```

Important notes about reasoning models:
- Only support text generation
- Require additional runtime inference
- System messages are removed or converted to developer messages
- maxTokens is mapped to max_completion_tokens
- Streaming is simulated by default

## Prompt Caching

Prompt caching is available for supported models (gpt-4o, gpt-4o-mini, o1-preview, and o1-mini):

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text, usage, experimental_providerMetadata } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: `A 1024-token or longer prompt...`,
});

console.log(`usage:`, {
  ...usage,
  cachedPromptTokens: experimental_providerMetadata?.openai?.cachedPromptTokens,
});
```

Notes:
- Automatically enabled for prompts ≥1024 tokens
- Cache persistence depends on infrastructure load
- Typically remains for 5-10 minutes, up to an hour during off-peak

## Audio Input

The gpt-4o-audio-preview model supports audio file input:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4o-audio-preview'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is the audio saying?' },
        {
          type: 'file',
          mimeType: 'audio/mpeg',
          data: fs.readFileSync('./data/audio.mp3'),
        },
      ],
    },
  ],
});
```

Note: This model requires audio input and won't work with non-audio data.

## Completion Models

Create completion API models using the `.completion()` method:

```javascript
const model = openai.completion('gpt-3.5-turbo-instruct');

// With additional settings
const modelWithOptions = openai.completion('gpt-3.5-turbo-instruct', {
  echo: true,
  logitBias: {
    '50256': -100,
  },
  suffix: 'some text',
  user: 'test-user',
});
```

### Completion Model Options

- `echo` (boolean): Echo back the prompt with the completion
- `logitBias` (Record<number, number>): Modify token likelihood
- `logProbs` (boolean | number): Return token log probabilities
- `suffix` (string): Text to append after completion
- `user` (string): Unique end-user identifier

## Model Capabilities

### Language Models

| Model | Image Input | Audio Input | Object Generation | Tool Usage |
|-------|-------------|-------------|-------------------|------------|
| gpt-4o | ✓ | ✓ | ✓ | ✓ |
| gpt-4o-mini | ✓ | ✓ | ✓ | ✓ |
| gpt-4o-audio-preview | ✓ | ✓ | ✓ | ✓ |
| gpt-4-turbo | ✓ | × | ✓ | ✓ |
| gpt-4 | ✓ | × | ✓ | ✓ |
| gpt-3.5-turbo | × | × | ✓ | ✓ |
| o1 | × | × | × | × |
| o1-mini | × | × | × | × |
| o1-preview | × | × | × | × |

### Embedding Models

Create embedding models:

```javascript
const model = openai.embedding('text-embedding-3-large');

// With options
const modelWithOptions = openai.embedding('text-embedding-3-large', {
  dimensions: 512,
  user: 'test-user'
});
```

#### Embedding Model Capabilities

| Model | Default Dimensions | Custom Dimensions |
|-------|-------------------|-------------------|
| text-embedding-3-large | 3072 | ✓ |
| text-embedding-3-small | 1536 | ✓ |
| text-embedding-ada-002 | 1536 | × |

### Image Models

Create image generation models:

```javascript
const model = openai.image('dall-e-3');
```

#### Image Model Capabilities

| Model | Sizes |
|-------|--------|
| dall-e-3 | 1024x1024, 1792x1024, 1024x1792 |
| dall-e-2 | 256x256, 512x512, 1024x1024 |