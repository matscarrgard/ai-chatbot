# Google Vertex AI Provider

The Google Vertex provider offers language model support for Google Vertex AI APIs, including Google's Gemini models and Anthropic's Claude partner models. It's compatible with both Node.js and Edge runtimes.

## Setup

Install the Google Vertex provider:

```bash
# Using pnpm
pnpm add @ai-sdk/google-vertex

# Using npm
npm install @ai-sdk/google-vertex

# Using yarn
yarn add @ai-sdk/google-vertex
```

## Google Vertex Provider Usage

### Provider Instance

Import the default provider instance:

```javascript
import { vertex } from '@ai-sdk/google-vertex';
```

For custom configurations:

```javascript
import { createVertex } from '@ai-sdk/google-vertex';

const vertex = createVertex({
  project: 'my-project', // optional
  location: 'us-central1', // optional
});
```

### Authentication

#### Node.js Runtime

Supports all standard Google Cloud authentication options through google-auth-library. Set credentials file path in GOOGLE_APPLICATION_CREDENTIALS environment variable.

Custom authentication:

```javascript
import { createVertex } from '@ai-sdk/google-vertex';

const vertex = createVertex({
  googleAuthOptions: {
    credentials: {
      client_email: 'my-email',
      private_key: 'my-private-key',
    },
  },
});
```

#### Edge Runtime

Import from edge-specific module:

```javascript
import { vertex } from '@ai-sdk/google-vertex/edge';
```

Required environment variables:
- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_PRIVATE_KEY_ID (optional)

### Configuration Options

Common Options:
- `project` (string): Google Cloud project ID. Default: GOOGLE_VERTEX_PROJECT env var
- `location` (string): Google Cloud location. Default: GOOGLE_VERTEX_LOCATION env var
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation
- `baseURL` (string): Custom API URL prefix

Node.js Specific:
- `googleAuthOptions`: Authentication options for Google Auth Library
  - `authClient`: Custom AuthClient
  - `keyFilename`: Path to credentials file
  - `credentials`: Client email and private key
  - `scopes`: Required API scopes
  - `projectId`: Project ID
  - `universeDomain`: Cloud universe domain

Edge Runtime Specific:
- `googleCredentials`:
  - `clientEmail`: Service account email
  - `privateKey`: Service account private key
  - `privateKeyId`: Private key ID

## Language Models

Create a model instance:

```javascript
const model = vertex('gemini-1.5-pro');

// With settings
const model = vertex('gemini-1.5-pro', {
  safetySettings: [
    { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_LOW_AND_ABOVE' },
  ],
});
```

### Model Options

- `structuredOutputs` (boolean): Enable structured output (default: true)
- `safetySettings`: Array of safety configurations
  - Categories:
    - HARM_CATEGORY_UNSPECIFIED
    - HARM_CATEGORY_HATE_SPEECH
    - HARM_CATEGORY_DANGEROUS_CONTENT
    - HARM_CATEGORY_HARASSMENT
    - HARM_CATEGORY_SEXUALLY_EXPLICIT
    - HARM_CATEGORY_CIVIC_INTEGRITY
  - Thresholds:
    - HARM_BLOCK_THRESHOLD_UNSPECIFIED
    - BLOCK_LOW_AND_ABOVE
    - BLOCK_MEDIUM_AND_ABOVE
    - BLOCK_ONLY_HIGH
    - BLOCK_NONE
- `useSearchGrounding` (boolean): Enable Google search grounding
- `audioTimestamp` (boolean): Enable timestamp understanding for audio files

### Example Usage

```javascript
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

const { text } = await generateText({
  model: vertex('gemini-1.5-pro'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## File Inputs

Support for various file types including PDFs:

```javascript
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

const { text } = await generateText({
  model: vertex('gemini-1.5-pro'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is an embedding model according to this document?' },
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

Note: URLs are automatically downloaded except for gs:// URLs, which require Google Cloud Storage API.

## Search Grounding

Enable search-based information access:

```javascript
import { vertex } from '@ai-sdk/google-vertex';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, experimental_providerMetadata } = await generateText({
  model: vertex('gemini-1.5-pro', {
    useSearchGrounding: true,
  }),
  prompt: 'List the top 5 San Francisco news from the past week.',
});

const metadata = experimental_providerMetadata?.google;
const groundingMetadata = metadata?.groundingMetadata;
const safetyRatings = metadata?.safetyRatings;
```

### Grounding Metadata Fields

- `webSearchQueries`: Array of search queries used
- `searchEntryPoint`: Main search result content
- `groundingSupports`: Array of support objects containing:
  - `segment`: Grounded text information
  - `text`: Actual text
  - `startIndex/endIndex`: Position
  - `groundingChunkIndices`: Supporting result references
  - `confidenceScores`: Confidence scores (0-1)

## Model Capabilities

### Language Models

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| gemini-2.0-flash-exp | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-flash | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-pro | ✓ | ✓ | ✓ | ✓ |

### Embedding Models

Create an embedding model:

```javascript
const model = vertex.textEmbeddingModel('text-embedding-004', {
  outputDimensionality: 512,
});
```

#### Embedding Model Capabilities

| Model | Max Values Per Call | Parallel Calls |
|-------|-------------------|----------------|
| text-embedding-004 | 2048 | ✓ |

### Image Models

Create and use Imagen models:

```javascript
import { vertex } from '@ai-sdk/google-vertex';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: vertex.image('imagen-3.0-generate-001'),
  prompt: 'A futuristic cityscape at sunset',
  aspectRatio: '16:9',
});
```

#### Image Model Capabilities

| Model | Aspect Ratios |
|-------|---------------|
| imagen-3.0-generate-001 | 1:1, 3:4, 4:3, 9:16, 16:9 |
| imagen-3.0-fast-generate-001 | 1:1, 3:4, 4:3, 9:16, 16:9 |

## Google Vertex Anthropic Provider

### Setup

Import the Anthropic provider:

```javascript
import { vertexAnthropic } from '@ai-sdk/google-vertex/anthropic';
```

For Edge runtime:

```javascript
import { vertexAnthropic } from '@ai-sdk/google-vertex/anthropic/edge';
```

### Computer Use Tools

#### Bash Tool

```javascript
const bashTool = vertexAnthropic.tools.bash_20241022({
  execute: async ({ command, restart }) => {
    // Implementation
  },
});
```

#### Text Editor Tool

```javascript
const textEditorTool = vertexAnthropic.tools.textEditor_20241022({
  execute: async ({
    command,
    path,
    file_text,
    insert_line,
    new_str,
    old_str,
    view_range,
  }) => {
    // Implementation
  },
});
```

#### Computer Tool

```javascript
const computerTool = vertexAnthropic.tools.computer_20241022({
  displayWidthPx: 1920,
  displayHeightPx: 1080,
  displayNumber: 0,
  execute: async ({ action, coordinate, text }) => {
    // Implementation
  },
});
```

### Anthropic Model Capabilities

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming | Computer Use |
|-------|-------------|-------------------|------------|----------------|--------------|
| claude-3-5-sonnet-v2@20241022 | ✓ | ✓ | ✓ | ✓ | ✓ |
| claude-3-5-sonnet@20240620 | ✓ | ✓ | ✓ | ✓ | ✓ |
| claude-3-5-haiku@20241022 | ✓ | ✓ | ✓ | ✓ | ✓ |
| claude-3-sonnet@20240229 | ✓ | ✓ | ✓ | ✓ | ✓ |
| claude-3-haiku@20240307 | ✓ | ✓ | ✓ | ✓ | ✓ |
| claude-3-opus@20240229 | ✓ | ✓ | ✓ | ✓ | ✓ |