# DeepSeek Provider

The DeepSeek provider offers access to powerful language models through the DeepSeek API, including their DeepSeek-V3 model. API keys can be obtained from the [DeepSeek Platform](https://platform.deepseek.ai).

## Setup

Install the DeepSeek provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/deepseek

# Using npm
npm install @ai-sdk/deepseek

# Using yarn
yarn add @ai-sdk/deepseek
```

## Provider Instance

Import the default provider instance:

```javascript
import { deepseek } from '@ai-sdk/deepseek';
```

For custom configurations:

```javascript
import { createDeepSeek } from '@ai-sdk/deepseek';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});
```

### Configuration Options

- `baseURL` (string): Custom URL prefix for API calls. Default: https://api.deepseek.com/v1
- `apiKey` (string): API key sent in Authorization header. Default: DEEPSEEK_API_KEY environment variable
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation

## Language Models

Create and use a language model:

```javascript
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

const { text } = await generateText({
  model: deepseek('deepseek-chat'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

DeepSeek language models can be used with `streamText` and `streamUI` functions.

## Model Capabilities

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| deepseek-chat | × | × | × | × |

Note: For a complete list of available models and their capabilities, refer to the DeepSeek documentation. Any available provider model ID can be used as a string when needed.