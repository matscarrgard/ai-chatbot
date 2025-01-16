# Azure OpenAI Provider

The Azure OpenAI provider offers language model support for the Azure OpenAI chat API.

## Setup

Install the Azure OpenAI provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/azure

# Using npm
npm install @ai-sdk/azure

# Using yarn
yarn add @ai-sdk/azure
```

## Provider Instance

Import the default provider instance:

```javascript
import { azure } from '@ai-sdk/azure';
```

For custom configurations:

```javascript
import { createAzure } from '@ai-sdk/azure';

const azure = createAzure({
  resourceName: 'your-resource-name', // Azure resource name
  apiKey: 'your-api-key',
});
```

### Configuration Options

- `resourceName` (string): Azure resource name. Default: AZURE_RESOURCE_NAME env variable
  - Used in URL: https://{resourceName}.openai.azure.com/openai/deployments/{modelId}{path}
- `apiKey` (string): API key for api-key header. Default: AZURE_API_KEY env variable
- `apiVersion` (string): Custom API version. Default: 2024-10-01-preview
- `baseURL` (string): Custom URL prefix for API calls
  - Alternative to resourceName
  - Resolved URL: {baseURL}/{modelId}{path}
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation

## Language Models

Create a language model instance:

```javascript
const model = azure('your-deployment-name');
```

### Example Usage

```javascript
import { azure } from '@ai-sdk/azure';
import { generateText } from 'ai';

const { text } = await generateText({
  model: azure('your-deployment-name'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

Note: Azure OpenAI sends larger chunks than OpenAI, which may make responses appear slower.

## Chat Models

The chat API URL format: https://RESOURCE_NAME.openai.azure.com/openai/deployments/DEPLOYMENT_NAME/chat/completions?api-version=API_VERSION

Create a chat model with additional settings:

```javascript
const model = azure('your-deployment-name', {
  logitBias: {
    '50256': -100,
  },
  user: 'test-user',
});
```

### Chat Model Options

- `logitBias` (Record<number, number>): Modify token likelihood (-100 to 100)
- `logProbs` (boolean | number): Return token log probabilities
- `parallelToolCalls` (boolean): Enable parallel function calling (default: true)
- `user` (string): Unique end-user identifier

## Completion Models

Create a completion model:

```javascript
const model = azure.completion('your-gpt-35-turbo-instruct-deployment');

// With additional settings
const model = azure.completion('your-gpt-35-turbo-instruct-deployment', {
  echo: true,
  logitBias: {
    '50256': -100,
  },
  suffix: 'some text',
  user: 'test-user',
});
```

### Completion Model Options

- `echo` (boolean): Echo prompt with completion
- `logitBias` (Record<number, number>): Modify token likelihood (-100 to 100)
- `logProbs` (boolean | number): Return token log probabilities
- `suffix` (string): Text to append after completion
- `user` (string): Unique end-user identifier

## Embedding Models

Create an embedding model:

```javascript
const model = azure.embedding('your-embedding-deployment');

// With additional settings
const model = azure.embedding('your-embedding-deployment', {
  dimensions: 512,
  user: 'test-user'
});
```

### Embedding Model Options

- `dimensions` (number): Output embedding dimensions (text-embedding-3 and later only)
- `user` (string): Unique end-user identifier

### Notes on Model Usage

- Azure OpenAI language models can be used with `streamText`, `generateObject`, `streamObject`, and `streamUI` functions
- Only gpt-35-turbo-instruct is currently supported for completion models
- When using logProbs, response size will increase and may slow down response times
- For token IDs in logitBias, use a tokenizer tool to convert text to token IDs
- The bias values between -1 and 1 adjust likelihood, while -100 or 100 enforce exclusion or inclusion