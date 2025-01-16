# Vercel AI SDK Documentation

## Table of Contents

- [Overview](#overview)
- [Foundations](#foundations)
  - [Generative Artificial Intelligence](#generative-artificial-intelligence)
  - [Large Language Models](#large-language-models)
  - [Embedding Models](#embedding-models)

## Overview

The AI SDK standardizes integrating artificial intelligence (AI) models across supported providers. This enables developers to focus on building great AI applications, rather than technical details.

### Text Generation Examples

Here's how you can generate text with various models using the AI SDK:

#### OpenAI
```javascript
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const { text } = await generateText({
  model: openai("gpt-4-turbo"),
  prompt: "What is love?"
})
```

#### Anthropic
```javascript
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

const { text } = await generateText({
  model: anthropic("claude-3"),
  prompt: "What is love?"
})
```

#### Google
```javascript
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const { text } = await generateText({
  model: google("gemini-pro"),
  prompt: "What is love?"
})
```

#### Mistral
```javascript
import { generateText } from "ai"
import { mistral } from "@ai-sdk/mistral"

const { text } = await generateText({
  model: mistral("mistral-medium"),
  prompt: "What is love?"
})
```

#### Custom
```javascript
import { generateText } from "ai"
import { custom } from "@ai-sdk/custom"

const { text } = await generateText({
  model: custom("your-model"),
  prompt: "What is love?"
})
```

## Foundations

### Generative Artificial Intelligence

Generative artificial intelligence refers to models that predict and generate various types of outputs (such as text, images, or audio) based on what's statistically likely, pulling from patterns they've learned from their training data. Examples include:

- Given a photo, a generative model can generate a caption
- Given an audio file, a generative model can generate a transcription
- Given a text description, a generative model can generate an image

### Large Language Models

A large language model (LLM) is a subset of generative models focused primarily on text. Key characteristics:

- Takes a sequence of words as input
- Predicts the most likely sequence to follow
- Assigns probabilities to potential next sequences
- Continues generating sequences until meeting specified stopping criteria
- Learns from massive collections of written text

**Important Limitation**: When asked about less known or absent information, like the birthday of a personal relative, LLMs might "hallucinate" or make up information. Consider how well-represented the needed information is in the model.

### Embedding Models

Embedding models serve a different purpose than generative models:

- Convert complex data (words or images) into dense vector representations
- Do not generate new text or data
- Provide representations of semantic and syntactic relationships
- Output can be used as input for other models or NLP tasks

# Providers and Models

## Overview

Companies such as OpenAI and Anthropic (providers) offer access to a range of large language models (LLMs) with differing strengths and capabilities through their own APIs.

The AI SDK Core offers a standardized approach to interacting with LLMs through a language model specification that abstracts differences between providers. This unified interface allows you to switch between providers with ease while using the same API for all providers.

## Official AI SDK Providers

The AI SDK includes the following official providers:

- OpenAI Provider (`@ai-sdk/openai`)
- Azure OpenAI Provider (`@ai-sdk/azure`)
- Anthropic Provider (`@ai-sdk/anthropic`)
- Amazon Bedrock Provider (`@ai-sdk/amazon-bedrock`)
- Google Generative AI Provider (`@ai-sdk/google`)
- Google Vertex Provider (`@ai-sdk/google-vertex`)
- Mistral Provider (`@ai-sdk/mistral`)
- xAI Grok Provider (`@ai-sdk/xai`)
- Together.ai Provider (`@ai-sdk/togetherai`)
- Cohere Provider (`@ai-sdk/cohere`)
- Fireworks Provider (`@ai-sdk/fireworks`)
- DeepInfra Provider (`@ai-sdk/deepinfra`)
- DeepSeek Provider (`@ai-sdk/deepseek`)
- Cerebras Provider (`@ai-sdk/cerebras`)
- Groq Provider (`@ai-sdk/groq`)

### OpenAI-Compatible APIs

The OpenAI provider can be used with OpenAI-compatible APIs:
- Perplexity
- LM Studio
- Baseten

## Community Providers

The open-source community has created the following providers:

- Ollama Provider (`ollama-ai-provider`)
- ChromeAI Provider (`chrome-ai`)
- FriendliAI Provider (`@friendliai/ai-provider`)
- Portkey Provider (`@portkey-ai/vercel-provider`)
- Cloudflare Workers AI Provider (`workers-ai-provider`)
- OpenRouter Provider (`@openrouter/ai-sdk-provider`)
- Crosshatch Provider (`@crosshatch/ai-provider`)
- Mixedbread Provider (`mixedbread-ai-provider`)
- Voyage AI Provider (`voyage-ai-provider`)
- Mem0 Provider (`@mem0/vercel-ai-provider`)
- Spark Provider (`spark-ai-provider`)
- AnthropicVertex Provider (`anthropic-vertex-ai`)

## Self-Hosted Models

You can access self-hosted models with the following providers:
- Ollama Provider
- LM Studio
- Baseten

Additionally, any self-hosted provider that supports the OpenAI specification can be used with the OpenAI Compatible Provider.

## Model Capabilities

Different models support various capabilities. Here's a comprehensive breakdown:

| Provider | Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|----------|--------|-------------|-------------------|------------|----------------|
| OpenAI | gpt-4o | ✓ | ✓ | ✓ | ✓ |
| OpenAI | gpt-4o-mini | ✓ | ✓ | ✓ | ✓ |
| OpenAI | gpt-4-turbo | ✓ | ✓ | ✓ | ✓ |
| OpenAI | gpt-4 | ✓ | ✓ | ✓ | ✓ |
| OpenAI | o1 | ✓ | ✓ | ✓ | ✓ |
| OpenAI | o1-mini | ✓ | ✓ | ✓ | ✓ |
| OpenAI | o1-preview | ✓ | ✓ | ✓ | ✓ |
| Anthropic | claude-3-5-sonnet-20241022 | ✓ | ✓ | ✓ | ✓ |
| Anthropic | claude-3-5-sonnet-20240620 | ✓ | ✓ | ✓ | ✓ |
| Anthropic | claude-3-5-haiku-20241022 | ✓ | ✓ | ✓ | ✓ |
| Mistral | pixtral-large-latest | ✓ | ✓ | ✓ | ✓ |
| Mistral | mistral-large-latest | ✓ | ✓ | ✓ | ✓ |
| Mistral | mistral-small-latest | ✓ | ✓ | ✓ | ✓ |
| Mistral | pixtral-12b-2409 | ✓ | ✓ | ✓ | ✓ |
| Google Generative AI | gemini-2.0-flash-exp | ✓ | ✓ | ✓ | ✓ |
| Google Generative AI | gemini-1.5-flash | ✓ | ✓ | ✓ | ✓ |
| Google Generative AI | gemini-1.5-pro | ✓ | ✓ | ✓ | ✓ |
| Google Vertex | gemini-2.0-flash-exp | ✓ | ✓ | ✓ | ✓ |
| Google Vertex | gemini-1.5-flash | ✓ | ✓ | ✓ | ✓ |
| Google Vertex | gemini-1.5-pro | ✓ | ✓ | ✓ | ✓ |
| xAI Grok | grok-2-1212 | ✓ | ✓ | ✓ | ✓ |
| xAI Grok | grok-2-vision-1212 | ✓ | ✓ | ✓ | ✓ |
| xAI Grok | grok-beta | ✓ | ✓ | ✓ | ✓ |
| xAI Grok | grok-vision-beta | ✓ | ✓ | ✓ | ✓ |
| DeepSeek | deepseek-chat | ✓ | ✓ | ✓ | ✓ |
| Cerebras | llama3.1-8b | ✓ | ✓ | ✓ | ✓ |
| Cerebras | llama3.1-70b | ✓ | ✓ | ✓ | ✓ |
| Cerebras | llama3.3-70b | ✓ | ✓ | ✓ | ✓ |
| Groq | llama-3.3-70b-versatile | ✓ | ✓ | ✓ | ✓ |
| Groq | llama-3.1-8b-instant | ✓ | ✓ | ✓ | ✓ |
| Groq | mixtral-8x7b-32768 | ✓ | ✓ | ✓ | ✓ |
| Groq | gemma2-9b-it | ✓ | ✓ | ✓ | ✓ |

Note: This table is not exhaustive. Additional models can be found in the provider documentation pages and on the provider websites.

# Streaming

## Overview

Streaming is a crucial feature for building responsive AI applications, particularly when working with large language models (LLMs) that can take significant time to generate complete responses.

## Benefits of Streaming

- Immediate feedback to users
- Reduced perceived latency 
- Better user experience for conversational applications
- Progressive display of long responses
- Real-time interaction capabilities

## Blocking vs Streaming UIs

### Blocking UI
- Waits for complete response before displaying anything
- Can lead to long wait times (5-40 seconds)
- Better for short, quick responses
- Simpler to implement

### Streaming UI
- Displays response parts as they become available
- Reduces perceived latency
- Ideal for chatbots and conversational interfaces
- More complex to implement but handled by the AI SDK

## Implementation

The AI SDK makes implementing streaming straightforward. Here's a basic example:

```javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const { textStream } = streamText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a poem about embedding models.',
});

for await (const textPart of textStream) {
  console.log(textPart);
}
```

## When to Use Streaming

Consider streaming when:
- Working with larger language models
- Building conversational interfaces
- Generating long-form content
- User experience is priority
- Real-time feedback is important

Consider blocking when:
- Using smaller, faster models
- Generating short responses
- Backend processing is required
- Simpler implementation is preferred

## Best Practices

1. **Error Handling**: Implement proper error handling for stream interruptions
2. **UI Feedback**: Show loading indicators even with streaming
3. **Fallback Strategy**: Have a blocking fallback if streaming fails
4. **Performance Monitoring**: Track streaming performance metrics
5. **User Control**: Allow users to cancel ongoing streams

## Overview

While large language models (LLMs) have powerful generation capabilities, they can struggle with discrete tasks (e.g., mathematics) and interactions with external systems (e.g., getting weather data). Tools solve this by providing LLMs with the ability to call specific functions and use their results.

For example, when asking an LLM about the "weather in London" with a weather tool available, it can:
1. Call the weather tool with "London" as the argument
2. Receive the weather data
3. Incorporate this real-time data into its response

## Tool Structure

A tool consists of three key properties:

```javascript
{
  description: string; // Optional description to guide tool selection
  parameters: Schema; // Zod schema or JSON schema defining parameters
  execute: async function; // Optional function to handle the tool call
}
```

Tools can be used with `generateText` and `streamText` by passing them to the `tools` parameter. For UI applications, `streamUI` uses UI generator tools that can return React components.

## Schema Definition

The AI SDK supports two types of schemas for defining tool parameters:

1. **Zod Schemas** (Recommended)
```javascript
import z from 'zod';

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      }),
    ),
    steps: z.array(z.string()),
  }),
});
```

2. **JSON Schemas** (using the `jsonSchema` function)

## Available Toolkits

Several providers offer pre-built toolkits that you can use immediately:

- **agentic**: Collection of 20+ tools, primarily for external API connections (Exa, E2B, etc.)
- **browserbase**: Browser tool for headless browser operations
- **Stripe agent tools**: Tools for Stripe interactions
- **Toolhouse**: AI function-calling for 25+ different actions

## Tool Execution Flow

1. The LLM decides to use a tool based on the input and tool description
2. It generates a tool call matching the defined schema
3. If the tool has an `execute` function, it runs automatically
4. Tool results are returned as tool result objects
5. Results can be automatically passed back to the LLM using multi-step calls

## Setup 

To use Zod schemas with your tools, install Zod:

```bash
# npm
npm install zod

# pnpm
pnpm add zod

# yarn
yarn add zod
```

## Overview

Prompts are instructions given to a large language model (LLM) to tell it what to do. The AI SDK supports three types of prompts:
- Text prompts
- Message prompts 
- System prompts

## Text Prompts

Text prompts are simple strings ideal for basic generation use cases. They can be set using the `prompt` property in AI SDK functions.

```javascript
const result = await generateText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

You can use template literals for dynamic data:

```javascript
const result = await generateText({
  model: yourModel,
  prompt:
    `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
    `Please suggest the best tourist activities for me to do.`,
});
```

## System Prompts

System prompts provide initial instructions to guide and constrain model behavior. They can be used with both `prompt` and `messages` properties:

```javascript
const result = await generateText({
  model: yourModel,
  system:
    `You help planning travel itineraries. ` +
    `Respond to the users' request with a list ` +
    `of the best stops to make in their destination.`,
  prompt:
    `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
    `Please suggest the best tourist activities for me to do.`,
});
```

## Message Prompts

Message prompts are arrays of user, assistant, and tool messages, ideal for chat interfaces and multi-modal prompts. They use the `messages` property.

Basic example:
```javascript
const result = await streamUI({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello, how can I help?' },
    { role: 'user', content: 'Where can I buy the best Currywurst in Berlin?' },
  ],
});
```

### Message Types

#### User Messages

1. **Text Parts**
```javascript
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Where can I buy the best Currywurst in Berlin?',
        },
      ],
    },
  ],
});
```

2. **Image Parts**
Images can be included as:
- base64-encoded image
- binary image (ArrayBuffer, Uint8Array, Buffer)
- URL (string or URL object)

Example with binary image:
```javascript
const result = await generateText({
  model,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail.' },
        {
          type: 'image',
          image: fs.readFileSync('./data/comic-cat.png'),
        },
      ],
    },
  ],
});
```

3. **File Parts**
Supported by select providers (Google Generative AI, Google Vertex AI, OpenAI for audio, Anthropic for PDF)

Example with PDF:
```javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-1.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is the file about?' },
        {
          type: 'file',
          mimeType: 'application/pdf',
          data: fs.readFileSync('./data/example.pdf'),
        },
      ],
    },
  ],
});
```

#### Assistant Messages

Assistant messages represent model responses and can contain text and tool calls:

```javascript
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello, how can I help?' },
  ],
});
```

With tool call:
```javascript
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'user', content: 'How many calories are in this block of cheese?' },
    {
      type: 'tool-call',
      toolCallId: '12345',
      toolName: 'get-nutrition-data',
      args: { cheese: 'Roquefort' },
    },
  ],
});
```

#### Tool Messages

Tool messages contain tool results and can be multi-modal (experimental, Anthropic only):

```javascript
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: '12345',
          toolName: 'get-nutrition-data',
          result: {
            name: 'Cheese, roquefort',
            calories: 369,
            fat: 31,
            protein: 22,
          },
          content: [
            {
              type: 'text',
              text: 'Here is an image of the nutrition data for the cheese:',
            },
            {
              type: 'image',
              data: fs.readFileSync('./data/roquefort-nutrition-data.png'),
              mimeType: 'image/png',
            },
          ],
        },
      ],
    },
  ],
});
```

#### System Messages

System messages can be used to guide the assistant's behavior:

```javascript
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'system', content: 'You help planning travel itineraries.' },
    {
      role: 'user',
      content:
        'I am planning a trip to Berlin for 3 days. Please suggest the best tourist activities for me to do.',
    },
  ],
});
```