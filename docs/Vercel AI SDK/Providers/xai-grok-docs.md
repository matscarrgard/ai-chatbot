# xAI Grok Provider

The xAI Grok provider offers language model support for the xAI API.

## Setup

Install the xAI Grok provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/xai

# Using npm
npm install @ai-sdk/xai

# Using yarn
yarn add @ai-sdk/xai
```

## Provider Instance

Import the default provider instance:

```javascript
import { xai } from '@ai-sdk/xai';
```

For custom configurations:

```javascript
import { createXai } from '@ai-sdk/xai';

const xai = createXai({
  apiKey: 'your-api-key',
});
```

### Configuration Options

- `baseURL` (string): Custom URL prefix for API calls. Default: https://api.x.ai/v1
- `apiKey` (string): API key sent in Authorization header. Default: XAI_API_KEY environment variable
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation

## Language Models

Create a model instance:

```javascript
const model = xai('grok-beta');
```

### Example Usage

```javascript
import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: xai('grok-2-1212'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

xAI language models can be used with `streamText`, `generateObject`, `streamObject`, and `streamUI` functions.

## Chat Models

Create a chat model with additional settings:

```javascript
const model = xai('grok-2-1212', {
  user: 'test-user', // optional unique user identifier
});
```

### Chat Model Options

- `user` (string): Unique end-user identifier for monitoring and abuse detection

## Model Capabilities

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| grok-2-1212 | ✓ | ✓ | ✓ | ✓ |
| grok-2-vision-1212 | ✓ | ✓ | ✓ | ✓ |
| grok-beta | ✓ | ✓ | ✓ | ✓ |
| grok-vision-beta | ✓ | ✓ | ✓ | ✓ |

Note: For a complete list of available models and their capabilities, refer to the xAI documentation. Any available provider model ID can be used as a string when needed.