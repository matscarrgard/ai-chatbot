# Amazon Bedrock Provider

The Amazon Bedrock provider offers language model support for the Amazon Bedrock APIs.

## Setup

Install the Bedrock provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/amazon-bedrock

# Using npm
npm install @ai-sdk/amazon-bedrock

# Using yarn
yarn add @ai-sdk/amazon-bedrock
```

## Prerequisites

Access to Amazon Bedrock foundation models isn't granted by default. An IAM user with sufficient permissions needs to request access through the console. Once granted, the model becomes available for all users in the account.

See the [Model Access Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) for more information.

## Authentication

### Step 1: Creating AWS Access Key and Secret Key

1. Login to AWS Management Console
2. Create an IAM User:
   - Navigate to IAM dashboard
   - Click "Users" → "Create user"
   - Select "Programmatic access"
   - Attach AmazonBedrockFullAccess policy
3. Create Access Key:
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Download the .csv file with credentials

### Step 2: Configuring Environment Variables

Add the following to your .env file:

```bash
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_REGION=YOUR_REGION
```

Note: Many frameworks (like Next.js) load .env automatically. Others may require a package like dotenv.

## Provider Instance

Import the default provider instance:

```javascript
import { bedrock } from '@ai-sdk/amazon-bedrock';
```

For custom configurations:

```javascript
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

const bedrock = createAmazonBedrock({
  region: 'us-east-1',
  accessKeyId: 'xxxxxxxxx',
  secretAccessKey: 'xxxxxxxxx',
  sessionToken: 'xxxxxxxxx',
});

// Alternative configuration using bedrockOptions
const bedrock = createAmazonBedrock({
  bedrockOptions: {
    region: 'us-east-1',
    credentials: {
      // ...
    },
  },
});
```

Note: The top-level credentials settings fall back to environment variable defaults. To avoid merged/conflicting credentials, either:
1. Use the bedrockOptions object (takes precedence)
2. Explicitly specify all settings (even if undefined)

### Configuration Options

- `region` (string): AWS region for API calls. Default: AWS_REGION env variable
- `accessKeyId` (string): AWS access key ID. Default: AWS_ACCESS_KEY_ID env variable
- `secretAccessKey` (string): AWS secret access key. Default: AWS_SECRET_ACCESS_KEY env variable
- `sessionToken` (string): Optional AWS session token. Default: AWS_SESSION_TOKEN env variable
- `bedrockOptions` (object): Optional Amazon Bedrock Library configuration (BedrockRuntimeClientConfig)
  - `region` (string): AWS region
  - `credentials` (object): AWS credentials

## Language Models

Create a model instance:

```javascript
const model = bedrock('meta.llama3-70b-instruct-v1:0');

// With model-specific settings
const model = bedrock('anthropic.claude-3-sonnet-20240229-v1:0', {
  additionalModelRequestFields: { top_k: 350 },
});
```

See Amazon Bedrock Inference Parameter Documentation for model-specific settings.

### Example Usage

```javascript
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';

const { text } = await generateText({
  model: bedrock('meta.llama3-70b-instruct-v1:0'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## File Inputs

Amazon Bedrock supports file inputs with specific models (e.g., anthropic.claude-3-haiku-20240307-v1:0):

```javascript
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';

const result = await generateText({
  model: bedrock('anthropic.claude-3-haiku-20240307-v1:0'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the pdf in detail.' },
        {
          type: 'file',
          data: fs.readFileSync('./data/ai.pdf'),
          mimeType: 'application/pdf',
        },
      ],
    },
  ],
});
```

## Guardrails

Implement Amazon Bedrock Guardrails:

```javascript
const result = await generateText({
  bedrock('anthropic.claude-3-sonnet-20240229-v1:0'),
  experimental_providerMetadata: {
    bedrock: {
      guardrailConfig: {
        guardrailIdentifier: '1abcd2ef34gh',
        guardrailVersion: '1',
        trace: 'enabled',
        streamProcessingMode: 'async',
      },
    },
  },
});

// Access trace information
if (result.experimental_providerMetadata?.bedrock.trace) {
  // Handle trace data
}
```

See the [Amazon Bedrock Guardrails documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) for more information.

## Model Capabilities

### Language Models

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| amazon.titan-tg1-large | × | × | × | × |
| amazon.titan-text-express-v1 | × | × | × | × |
| anthropic.claude-3-5-sonnet-20241022-v2:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-3-5-sonnet-20240620-v1:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-3-5-haiku-20241022-v1:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-3-opus-20240229-v1:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-3-sonnet-20240229-v1:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-3-haiku-20240307-v1:0 | ✓ | ✓ | ✓ | ✓ |
| anthropic.claude-v2:1 | × | × | × | × |
| cohere.command-r-v1:0 | × | × | × | × |
| cohere.command-r-plus-v1:0 | × | × | × | × |
| meta.llama2-13b-chat-v1 | × | × | × | × |
| meta.llama2-70b-chat-v1 | × | × | × | × |
| meta.llama3-8b-instruct-v1:0 | × | × | × | × |
| meta.llama3-70b-instruct-v1:0 | × | × | × | × |
| meta.llama3-1-8b-instruct-v1:0 | × | × | × | × |
| meta.llama3-1-70b-instruct-v1:0 | × | × | × | × |
| meta.llama3-1-405b-instruct-v1:0 | × | × | × | × |
| meta.llama3-2-1b-instruct-v1:0 | × | × | × | × |
| meta.llama3-2-3b-instruct-v1:0 | × | × | × | × |
| meta.llama3-2-11b-instruct-v1:0 | × | × | × | × |
| meta.llama3-2-90b-instruct-v1:0 | × | × | × | × |
| mistral.mistral-7b-instruct-v0:2 | × | × | × | × |
| mistral.mixtral-8x7b-instruct-v0:1 | × | × | × | × |
| mistral.mistral-large-2402-v1:0 | × | × | × | × |
| mistral.mistral-small-2402-v1:0 | × | × | × | × |

## Embedding Models

Create an embedding model:

```javascript
const model = bedrock.embedding('amazon.titan-embed-text-v1');

// With additional settings
const model = bedrock.embedding('amazon.titan-embed-text-v2:0', {
  dimensions: 512,
  normalize: true
});
```

### Embedding Options

- `dimensions` (number): Output dimensions (1024 default, 512, or 256)
- `normalize` (boolean): Normalize output embeddings (default: true)

### Embedding Model Capabilities

| Model | Default Dimensions | Custom Dimensions |
|-------|-------------------|-------------------|
| amazon.titan-embed-text-v1 | 1536 | × |
| amazon.titan-embed-text-v2:0 | 1024 | ✓ |