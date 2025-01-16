# Google Generative AI Provider

The Google Generative AI provider offers language and embedding model support for the Google Generative AI APIs.

## Setup

Install the Google provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/google

# Using npm
npm install @ai-sdk/google

# Using yarn
yarn add @ai-sdk/google
```

## Provider Instance

Import the default provider instance:

```javascript
import { google } from '@ai-sdk/google';
```

For custom configurations:

```javascript
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  // custom settings
});
```

### Configuration Options

- `baseURL` (string): Custom URL prefix for API calls. Default: https://generativelanguage.googleapis.com/v1beta
- `apiKey` (string): API key for x-goog-api-key header. Default: GOOGLE_GENERATIVE_AI_API_KEY env variable
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation

## Language Models

Create a model instance:

```javascript
const model = google('gemini-1.5-pro-latest');

// With model-specific settings
const model = google('gemini-1.5-pro-latest', {
  safetySettings: [
    { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_LOW_AND_ABOVE' },
  ],
});
```

Note: Fine-tuned models can be used by prefixing the model ID with `tunedModels/`, e.g., `tunedModels/my-model`.

### Model Options

- `cachedContent` (string): Optional cached content name (format: cachedContents/{cachedContent})
- `structuredOutputs` (boolean): Enable structured output (default: true)
- `safetySettings` (Array):
  - `category`: 
    - HARM_CATEGORY_HATE_SPEECH
    - HARM_CATEGORY_DANGEROUS_CONTENT
    - HARM_CATEGORY_HARASSMENT
    - HARM_CATEGORY_SEXUALLY_EXPLICIT
  - `threshold`:
    - HARM_BLOCK_THRESHOLD_UNSPECIFIED
    - BLOCK_LOW_AND_ABOVE
    - BLOCK_MEDIUM_AND_ABOVE
    - BLOCK_ONLY_HIGH
    - BLOCK_NONE

### Example Usage

```javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text } = await generateText({
  model: google('gemini-1.5-pro-latest'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## File Inputs

Support for file inputs like PDFs:

```javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-1.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What is an embedding model according to this document?',
        },
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

Note: URLs are automatically downloaded except for https://generativelanguage.googleapis.com/v1beta/files/. Use Google Generative AI Files API for larger files.

## Cached Content

Implement content caching for supported models:

```javascript
import { google } from '@ai-sdk/google';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import { generateText } from 'ai';

const cacheManager = new GoogleAICacheManager(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
);

// Supported models for caching
type GoogleModelCacheableId =
  | 'models/gemini-1.5-flash-001'
  | 'models/gemini-1.5-pro-001';

const model: GoogleModelCacheableId = 'models/gemini-1.5-pro-001';

const { name: cachedContent } = await cacheManager.create({
  model,
  contents: [
    {
      role: 'user',
      parts: [{ text: '1000 Lasanga Recipes...' }],
    },
  ],
  ttlSeconds: 60 * 5,
});

const { text: veggieLasangaRecipe } = await generateText({
  model: google(model, { cachedContent }),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## Search Grounding

Enable search-based information access:

```javascript
import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, experimental_providerMetadata } = await generateText({
  model: google('gemini-1.5-pro', {
    useSearchGrounding: true,
  }),
  prompt: 'List the top 5 San Francisco news from the past week.',
});

// Access grounding metadata
const metadata = experimental_providerMetadata?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
const groundingMetadata = metadata?.groundingMetadata;
const safetyRatings = metadata?.safetyRatings;
```

### Grounding Metadata Fields

- `webSearchQueries` (string[] | null): Search queries used
- `searchEntryPoint` ({ renderedContent: string } | null): Main search result content
- `groundingSupports`: Array of support objects containing:
  - `segment`: Grounded text segment information
  - `text`: Actual text segment
  - `startIndex`: Starting position
  - `endIndex`: Ending position
  - `groundingChunkIndices`: Supporting search result references
  - `confidenceScores`: Confidence scores (0-1)

Note: Dynamic retrieval mode and threshold are not yet supported.

## Troubleshooting

### Schema Limitations

Google Generative AI API uses OpenAPI 3.0 schema subset, with some limitations:

```javascript
// Workaround for unsupported schema features
const result = await generateObject({
  model: google('gemini-1.5-pro-latest', {
    structuredOutputs: false,
  }),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    contact: z.union([
      z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      z.object({
        type: z.literal('phone'),
        value: z.string(),
      }),
    ]),
  }),
  prompt: 'Generate an example person for testing.',
});
```

Unsupported Zod features:
- z.union
- z.record

## Model Capabilities

### Language Models

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| gemini-2.0-flash-exp | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-pro-latest | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-pro | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-flash-latest | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-flash | ✓ | ✓ | ✓ | ✓ |

## Embedding Models

Create an embedding model:

```javascript
const model = google.textEmbeddingModel('text-embedding-004');

// With options
const model = google.textEmbeddingModel('text-embedding-004', {
  outputDimensionality: 512,
});
```

### Embedding Options

- `outputDimensionality` (number): Optional reduced dimension for output embedding

### Embedding Model Capabilities

| Model | Default Dimensions | Custom Dimensions |
|-------|-------------------|-------------------|
| text-embedding-004 | 768 | ✓ |