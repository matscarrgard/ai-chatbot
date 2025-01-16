# Vercel AI SDK Core Documentation

## Overview

### Introduction
Large Language Models (LLMs) are advanced programs that can understand, create, and engage with human language on a large scale. They are trained on vast amounts of written material to recognize patterns in language and predict what might come next in a given piece of text.

AI SDK Core **simplifies working with LLMs by offering a standardized way of integrating them into your app** - so you can focus on building great AI applications for your users, not waste time on technical details.

### Core Functions
AI SDK Core provides several key functions designed for text generation, structured data generation, and tool usage. These functions take a standardized approach to setting up prompts and settings, making it easier to work with different models:

- **generateText**: Generates text and tool calls. This function is ideal for non-interactive use cases such as automation tasks where you need to write text (e.g. drafting email or summarizing web pages) and for agents that use tools.

- **streamText**: Stream text and tool calls. You can use the `streamText` function for interactive use cases such as chat bots and content streaming.

- **generateObject**: Generates a typed, structured object that matches a Zod schema. You can use this function to force the language model to return structured data, e.g. for information extraction, synthetic data generation, or classification tasks.

- **streamObject**: Stream a structured object that matches a Zod schema. You can use this function to stream generated UIs.

## Code Examples

### Basic Text Generation

#### OpenAI Implementation
```javascript
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const { text } = await generateText({
  model: openai("gpt-4-turbo"),
  prompt: "What is love?"
})
```

#### Sample Response
```text
Love is a complex and multifaceted emotion that can be felt and expressed in many different ways. It involves deep affection, care, compassion, and connection towards another person or thing. Love can take on various forms such as romantic love, platonic love, familial love, or self-love.
```

### Core Function Examples

#### Text Generation (Non-Streaming)
```javascript
import { generateText } from "ai"

// Basic text generation example
const { text } = await generateText({
  model: yourModel,
  prompt: "Your prompt here"
})
```

#### Text Streaming
```javascript
import { streamText } from "ai"

// Streaming text example
const stream = await streamText({
  model: yourModel,
  prompt: "Your prompt here"
})
```

#### Structured Object Generation
```javascript
import { generateObject } from "ai"

// Generate structured data example
const { object } = await generateObject({
  model: yourModel,
  prompt: "Your prompt here",
  schema: yourZodSchema
})
```

#### Object Streaming
```javascript
import { streamObject } from "ai"

// Stream structured data example
const stream = await streamObject({
  model: yourModel,
  prompt: "Your prompt here",
  schema: yourZodSchema
})
```

### Provider-Specific Examples

#### Anthropic
```javascript
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

const { text } = await generateText({
  model: anthropic("claude-3"),
  prompt: "Your prompt here"
})
```

#### Google
```javascript
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const { text } = await generateText({
  model: google("gemini-pro"),
  prompt: "Your prompt here"
})
```

#### Mistral
```javascript
import { generateText } from "ai"
import { mistral } from "@ai-sdk/mistral"

const { text } = await generateText({
  model: mistral("mistral-medium"),
  prompt: "Your prompt here"
})
```

#### Custom Implementation
```javascript
import { generateText } from "ai"
import { customProvider } from "@ai-sdk/custom"

const { text } = await generateText({
  model: customProvider("your-model"),
  prompt: "Your prompt here"
})
```

## Implementation Notes
- Replace `yourModel` with the specific model instance from your chosen provider
- Replace `yourZodSchema` with your defined Zod schema for structured data generation
- Replace `"Your prompt here"` with your actual prompt text
- Error handling has been omitted for brevity but should be implemented in production code

## Model Support
The SDK supports various LLM providers including:
- OpenAI
- Anthropic
- Google
- Mistral
- Custom implementations

## Generating and Streaming Text

Large language models (LLMs) can generate text in response to a prompt, which can contain instructions and information to process. For example, you can ask a model to come up with a recipe, draft an email, or summarize a document.

The AI SDK Core provides two functions to generate text and stream it from LLMs:

- `generateText`: Generates text for a given prompt and model.
- `streamText`: Streams text from a given prompt and model.

Advanced LLM features such as tool calling and structured data generation are built on top of text generation.

### generateText Details

The result object of generateText contains several promises that resolve when all required data is available:

- `result.text`: The generated text
- `result.finishReason`: The reason the model finished generating text
- `result.usage`: The usage of the model during text generation

### streamText Details

The `streamText` function is ideal for interactive use cases where immediate response is important. The result object provides:

- `result.textStream`: Both a ReadableStream and an AsyncIterable
- Helper functions for integration:
  - `result.toDataStreamResponse()`: Creates a data stream HTTP response
  - `result.pipeDataStreamToResponse()`: Writes data stream delta output to a Node.js response
  - `result.toTextStreamResponse()`: Creates a simple text stream HTTP response
  - `result.pipeTextStreamToResponse()`: Writes text delta output to a Node.js response

#### Callback Features

##### onChunk Callback
The `onChunk` callback is triggered for each chunk of the stream with these chunk types:
- text-delta
- tool-call
- tool-result
- tool-call-streaming-start (when experimental_toolCallStreaming is enabled)
- tool-call-delta (when experimental_toolCallStreaming is enabled)

##### onFinish Callback
Triggered when the stream is finished, providing:
- text
- usage information
- finish reason
- messages

#### Stream Transformation

You can use the `experimental_transform` option to transform the stream. The AI SDK Core provides a `smoothStream` function for smoothing text streaming.

##### Custom Transformations
Example of a custom transformation that converts text to uppercase:

```javascript
const upperCaseTransform =
  <TOOLS extends Record<string, CoreTool>>() =>
  (options: { tools: TOOLS; stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        controller.enqueue(
          chunk.type === 'text-delta'
            ? { ...chunk, textDelta: chunk.textDelta.toUpperCase() }
            : chunk,
        );
      },
    });
```

#### Generating Long Text

For generating text beyond model output limits, use the `experimental_continueSteps` setting:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const {
  text, // combined text
  usage, // combined usage of all steps
} = await generateText({
  model: openai('gpt-4o'), // 4096 output tokens
  maxSteps: 5, // enable multi-step calls
  experimental_continueSteps: true,
  prompt:
    'Write a book about Roman history, ' +
    'from the founding of the city of Rome ' +
    'to the fall of the Western Roman Empire. ' +
    'Each chapter MUST HAVE at least 1000 words.',
});
```

## Generating Structured Data

While text generation can be useful, your use case will likely call for generating structured data. For example, you might want to extract information from text, classify data, or generate synthetic data.

Many language models are capable of generating structured data, often defined as using "JSON modes" or "tools". However, you need to manually provide schemas and then validate the generated data as LLMs can produce incorrect or incomplete structured data.

The AI SDK standardises structured object generation across model providers with the `generateObject` and `streamObject` functions.

### Generate Object

The `generateObject` generates structured data from a prompt. The schema is also used to validate the generated data, ensuring type safety and correctness.

```javascript
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: yourModel,
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

### Stream Object

Given the added complexity of returning structured data, model response time can be unacceptable for your interactive use case. With the `streamObject` function, you can stream the model's response as it is generated.

```javascript
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  // ...
});

// use partialObjectStream as an async iterable
for await (const partialObject of partialObjectStream) {
  console.log(partialObject);
}
```

### Output Strategy

You can use both functions with different output strategies:

#### Object Strategy
The default output strategy is object, which returns the generated data as an object.

#### Array Strategy
For generating an array of objects:

```javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { elementStream } = streamObject({
  model: openai('gpt-4-turbo'),
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z.string().describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});
```

#### Enum Strategy
For classification tasks:

```javascript
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: yourModel,
  output: 'enum',
  enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
  prompt: 'Classify the genre of this movie plot: "A group of astronauts travel through a wormhole in search of a new habitable planet for humanity."',
});
```

#### No Schema Strategy
For dynamic user requests:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: openai('gpt-4-turbo'),
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});
```

### Generation Mode

The SDK supports different methods for generating structured data:

- **auto**: The provider chooses the best mode (default)
- **tool**: Uses a tool with JSON schema as parameters
- **json**: Uses JSON response format when supported

### Error Handling

The SDK provides robust error handling through the `AI_NoObjectGeneratedError`:

```javascript
import { generateObject, NoObjectGeneratedError } from 'ai';

try {
  await generateObject({ model, schema, prompt });
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    console.log('NoObjectGeneratedError');
    console.log('Cause:', error.cause);
    console.log('Text:', error.text);
    console.log('Response:', error.response);
    console.log('Usage:', error.usage);
  }
}
```

### Structured Outputs with generateText and streamText

You can use structured outputs with the core text generation functions:

```javascript
// With generateText
const { experimental_output } = await generateText({
  experimental_output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number().nullable().describe('Age of the person.'),
      contact: z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      occupation: z.object({
        type: z.literal('employed'),
        company: z.string(),
        position: z.string(),
      }),
    }),
  }),
  prompt: 'Generate an example person for testing.',
});
```

## Tool Calling

Tools are objects that can be called by the model to perform a specific task. AI SDK Core tools contain three elements:

- **description**: An optional description of the tool that can influence when the tool is picked
- **parameters**: A Zod schema or a JSON schema that defines the parameters
- **execute**: An optional async function that is called with the arguments from the tool call

### Basic Tool Implementation

```javascript
import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
```

### Multi-Step Calls

Multi-step calls are enabled using the `maxSteps` setting:

```javascript
const { text, steps } = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  maxSteps: 5, // allow up to 5 steps
  prompt: 'What is the weather in San Francisco?',
});
```

### Tool Execution Options

#### Tool Call ID
```javascript
import { StreamData, streamText, tool } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const data = new StreamData();

  const result = streamText({
    messages,
    tools: {
      myTool: tool({
        execute: async (args, { toolCallId }) => {
          data.appendMessageAnnotation({
            type: 'tool-status',
            toolCallId,
            status: 'in-progress',
          });
        },
      }),
    },
    onFinish() {
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
}
```

#### Messages Access
```javascript
import { generateText, tool } from 'ai';

const result = await generateText({
  tools: {
    myTool: tool({
      execute: async (args, { messages }) => {
        // use the message history in e.g. calls to other language models
        return something;
      },
    }),
  },
});
```

#### Abort Signals
```javascript
const result = await generateText({
  model: yourModel,
  abortSignal: myAbortSignal, // signal that will be forwarded to tools
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({ location: z.string() }),
      execute: async ({ location }, { abortSignal }) => {
        return fetch(
          `https://api.weatherapi.com/v1/current.json?q=${location}`,
          { signal: abortSignal },
        );
      },
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
```

### Error Handling

The SDK provides three tool-call related errors:
- NoSuchToolError
- InvalidToolArgumentsError
- ToolExecutionError
- ToolCallRepairError

#### With generateText
```javascript
try {
  const result = await generateText({
    //...
  });
} catch (error) {
  if (NoSuchToolError.isInstance(error)) {
    // handle the no such tool error
  } else if (InvalidToolArgumentsError.isInstance(error)) {
    // handle the invalid tool arguments error
  } else if (ToolExecutionError.isInstance(error)) {
    // handle the tool execution error
  } else {
    // handle other errors
  }
}
```

#### With streamText
```javascript
const result = streamText({
  // ...
});

return result.toDataStreamResponse({
  getErrorMessage: error => {
    if (NoSuchToolError.isInstance(error)) {
      return 'The model tried to call a unknown tool.';
    } else if (InvalidToolArgumentsError.isInstance(error)) {
      return 'The model called a tool with invalid arguments.';
    } else if (ToolExecutionError.isInstance(error)) {
      return 'An error occurred during tool execution.';
    } else {
      return 'An unknown error occurred.';
    }
  },
});
```

### Advanced Features

#### Tool Call Repair
```javascript
const result = await generateText({
  model,
  tools,
  prompt,
  experimental_repairToolCall: async ({
    toolCall,
    tools,
    parameterSchema,
    error,
    messages,
    system,
  }) => {
    if (NoSuchToolError.isInstance(error)) {
      return null; // do not attempt to fix invalid tool names
    }

    const tool = tools[toolCall.toolName as keyof typeof tools];
    const { object: repairedArgs } = await generateObject({
      model: openai('gpt-4o', { structuredOutputs: true }),
      schema: tool.parameters,
      prompt: [
        `The model tried to call the tool "${toolCall.toolName}"`,
        JSON.stringify(toolCall.args),
        `The tool accepts the following schema:`,
        JSON.stringify(parameterSchema(toolCall)),
        'Please fix the arguments.',
      ].join('\n'),
    });

    return { ...toolCall, args: JSON.stringify(repairedArgs) };
  },
});
```

#### Multi-modal Tool Results
```javascript
const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: {
    computer: anthropic.tools.computer_20241022({
      async execute({ action, coordinate, text }) {
        switch (action) {
          case 'screenshot': {
            return {
              type: 'image',
              data: fs.readFileSync('./data/screenshot-editor.png').toString('base64'),
            };
          }
          default: {
            return `executed ${action}`;
          }
        }
      },
      experimental_toToolResultContent(result) {
        return typeof result === 'string'
          ? [{ type: 'text', text: result }]
          : [{ type: 'image', data: result.data, mimeType: 'image/png' }];
      },
    }),
  },
});
```

## Agents

AI agents let the language model execute a series of steps in a non-deterministic way. The model can make tool calling decisions based on the context of the conversation, the user's input, and previous tool calls and results.

### Basic Agent Implementation

One approach to implementing agents is to allow the LLM to choose the next step in a loop. With `generateText`, you can combine tools with `maxSteps`. This makes it possible to implement agents that reason at each step and make decisions based on the context.

Example of a math problem-solving agent:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import * as mathjs from 'mathjs';
import { z } from 'zod';

const { text: answer } = await generateText({
  model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
  tools: {
    calculate: tool({
      description:
        'A tool for evaluating mathematical expressions. ' +
        'Example expressions: ' +
        "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
      parameters: z.object({ expression: z.string() }),
      execute: async ({ expression }) => mathjs.evaluate(expression),
    }),
  },
  maxSteps: 10,
  system:
    'You are solving math problems. ' +
    'Reason step by step. ' +
    'Use the calculator when necessary. ' +
    'When you give the final answer, ' +
    'provide an explanation for how you arrived at it.',
  prompt:
    'A taxi driver earns $9461 per 1-hour of work. ' +
    'If he works 12 hours a day and in 1 hour ' +
    'he uses 12 liters of petrol with a price  of $134 for 1 liter. ' +
    'How much money does he earn in one day?',
});
```

### Structured Answers

You can implement structured answers in two ways:
1. Using an answer tool with `toolChoice: 'required'`
2. Using the `experimental_output` setting for `generateText`

Example with answer tool:

```javascript
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

const { toolCalls } = await generateText({
  model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
  tools: {
    calculate: tool({
      description:
        'A tool for evaluating mathematical expressions. Example expressions: ' +
        "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
      parameters: z.object({ expression: z.string() }),
      execute: async ({ expression }) => mathjs.evaluate(expression),
    }),
    // answer tool: the LLM will provide a structured answer
    answer: tool({
      description: 'A tool for providing the final answer.',
      parameters: z.object({
        steps: z.array(
          z.object({
            calculation: z.string(),
            reasoning: z.string(),
          }),
        ),
        answer: z.string(),
      }),
      // no execute function - invoking it will terminate the agent
    }),
  },
  toolChoice: 'required',
  maxSteps: 10,
  system:
    'You are solving math problems. ' +
    'Reason step by step. ' +
    'Use the calculator when necessary. ' +
    'The calculator can only do simple additions, subtractions, multiplications, and divisions. ' +
    'When you give the final answer, provide an explanation for how you got it.',
  prompt: 'A taxi driver earns $9461 per 1-hour work...',
});
```

### Step Management

#### Accessing Steps
You can access information from all steps using the steps property:

```javascript
import { generateText } from 'ai';

const { steps } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 10,
  // ...
});

// extract all tool calls from the steps:
const allToolCalls = steps.flatMap(step => step.toolCalls);
```

#### Step Completion Notification
Use the `onStepFinish` callback to get notified when each step completes:

```javascript
import { generateText } from 'ai';

const result = await generateText({
  model: yourModel,
  maxSteps: 10,
  onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
    // your own logic, e.g. for saving the chat history or recording usage
  },
  // ...
});
```

## Prompt Engineering

### Tips for Tool Prompts

When creating prompts that include tools, consider these best practices:

1. **Model Selection**
   - Use models strong at tool calling (e.g., gpt-4 or gpt-4-turbo)
   - Weaker models may struggle with complex tool interactions

2. **Tool Design**
   - Keep the number of tools low (5 or less recommended)
   - Minimize tool parameter complexity
   - Use meaningful names for tools and parameters
   - Add descriptions to Zod schema properties using `.describe()`
   - Include tool output information in tool descriptions when dependencies exist

3. **Documentation**
   - Include example input/outputs in JSON format
   - Provide clear information about tool usage and expectations

### Tool & Structured Data Schemas

#### Handling Dates
Zod expects JavaScript Date objects, but models return dates as strings. Here's how to handle this:

```javascript
const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    events: z.array(
      z.object({
        event: z.string(),
        date: z
          .string()
          .date()
          .transform(value => new Date(value)),
      }),
    ),
  }),
  prompt: 'List 5 important events from the the year 2000.',
});
```

### Debugging

#### Inspecting Warnings
Check if your prompt, tools, and settings are handled correctly by the provider:

```javascript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello, world!',
});

console.log(result.warnings);
```

#### HTTP Request Bodies
For providers like OpenAI that expose raw HTTP request bodies:

```javascript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello, world!',
});

console.log(result.request.body);
```

## Settings

Large language models (LLMs) typically provide settings to augment their output. Here's a basic example of using common settings:

```javascript
const result = await generateText({
  model: yourModel,
  maxTokens: 512,
  temperature: 0.3,
  maxRetries: 5,
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

### Common Settings

#### Token Control
- **maxTokens**: Maximum number of tokens to generate.

#### Temperature and Sampling
- **temperature**: Controls randomness in generation. Lower values (near 0) for more deterministic results, higher values for more randomness.
- **topP**: Nucleus sampling. Value between 0 and 1 determining probability mass to consider.
- **topK**: Limits sampling to top K options for each token. Recommended for advanced use cases.

Note: It's recommended to set either temperature or topP, but not both.

#### Penalty Settings
- **presencePenalty**: Affects likelihood of repeating information from the prompt.
- **frequencyPenalty**: Affects likelihood of repeating words or phrases.
- **stopSequences**: Sequences that will stop text generation when encountered.

#### Control Settings
- **seed**: Integer seed for random sampling. Enables deterministic results when supported.
- **maxRetries**: Maximum number of retries (Default: 2, set to 0 to disable).

#### Abort and Timeout
```javascript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Invent a new holiday and describe its traditions.',
  abortSignal: AbortSignal.timeout(5000), // 5 seconds
});
```

#### HTTP Headers
For HTTP-based providers, you can add custom headers:

```javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Invent a new holiday and describe its traditions.',
  headers: {
    'Prompt-Id': 'my-prompt-id',
  },
});
```

### Provider Support
Not all providers support all common settings. If a setting isn't supported, a warning will be generated. You can check the `warnings` property in the result object to see any generated warnings.

## Embeddings

Embeddings are a way to represent words, phrases, or images as vectors in a high-dimensional space. In this space, similar words are close to each other, and the distance between words can be used to measure their similarity.

### Single Value Embedding

```javascript
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

// 'embedding' is a single embedding object (number[])
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'sunny day at the beach',
});
```

### Batch Embedding

For tasks like preparing data for retrieval-augmented generation (RAG):

```javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';

// 'embeddings' is an array of embedding objects (number[][])
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: [
    'sunny day at the beach',
    'rainy afternoon in the city',
    'snowy night in the mountains',
  ],
});
```

### Similarity Calculation

```javascript
import { openai } from '@ai-sdk/openai';
import { cosineSimilarity, embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['sunny day at the beach', 'rainy afternoon in the city'],
});

console.log(
  `cosine similarity: ${cosineSimilarity(embeddings[0], embeddings[1])}`,
);
```

### Token Usage Tracking

```javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const { embedding, usage } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'sunny day at the beach',
});

console.log(usage); // { tokens: 10 }
```

### Configuration Options

#### Retries
```javascript
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'sunny day at the beach',
  maxRetries: 0, // Disable retries
});
```

#### Abort Signals and Timeouts
```javascript
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'sunny day at the beach',
  abortSignal: AbortSignal.timeout(1000), // Abort after 1 second
});
```

#### Custom Headers
```javascript
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'sunny day at the beach',
  headers: { 'X-Custom-Header': 'custom-value' },
});
```

### Embedding Providers & Models

| Provider | Model | Embedding Dimensions |
|----------|-------|---------------------|
| OpenAI | text-embedding-3-large | 3072 |
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-ada-002 | 1536 |
| Google Generative AI | text-embedding-004 | 768 |
| Mistral | mistral-embed | 1024 |
| Cohere | embed-english-v3.0 | 1024 |
| Cohere | embed-multilingual-v3.0 | 1024 |
| Cohere | embed-english-light-v3.0 | 384 |
| Cohere | embed-multilingual-light-v3.0 | 384 |
| Cohere | embed-english-v2.0 | 4096 |
| Cohere | embed-english-light-v2.0 | 1024 |
| Cohere | embed-multilingual-v2.0 | 768 |
| Amazon Bedrock | amazon.titan-embed-text-v1 | 1024 |
| Amazon Bedrock | amazon.titan-embed-text-v2:0 | 1024 |

## Image Generation

> Note: Image generation is an experimental feature.

The AI SDK provides the `generateImage` function to generate images based on a given prompt using an image model.

### Basic Usage

```javascript
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
});

// Access image data
const base64 = image.base64; // base64 image data
const uint8Array = image.uint8Array; // Uint8Array image data
```

### Size and Aspect Ratio Options

#### Fixed Size
```javascript
const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
  size: '1024x1024',
});
```

#### Aspect Ratio
```javascript
import { vertex } from '@ai-sdk/google-vertex';

const { image } = await generateImage({
  model: vertex.image('imagen-3.0-generate-001'),
  prompt: 'Santa Claus driving a Cadillac',
  aspectRatio: '16:9',
});
```

### Multiple Image Generation

```javascript
const { images } = await generateImage({
  model: openai.image('dall-e-2'),
  prompt: 'Santa Claus driving a Cadillac',
  n: 4, // number of images to generate
});
```

#### Batch Size Configuration
```javascript
const model = openai.image('dall-e-2', {
  maxImagesPerCall: 5, // Override the default batch size
});

const { images } = await generateImage({
  model,
  prompt: 'Santa Claus driving a Cadillac',
  n: 10, // Will make 2 calls of 5 images each
});
```

### Advanced Features

#### Seed Control
```javascript
const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
  seed: 1234567890,
});
```

#### Provider-Specific Settings
```javascript
const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
  size: '1024x1024',
  providerOptions: {
    openai: { style: 'vivid', quality: 'hd' },
  },
});
```

### Configuration Options

#### Abort Signals and Timeouts
```javascript
const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
  abortSignal: AbortSignal.timeout(1000), // Abort after 1 second
});
```

#### Custom Headers
```javascript
const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  value: 'sunny day at the beach',
  headers: { 'X-Custom-Header': 'custom-value' },
});
```

### Supported Image Models

| Provider | Model | Supported Sizes/Ratios |
|----------|-------|------------------------|
| OpenAI | dall-e-3 | 1024x1024, 1792x1024, 1024x1792 |
| OpenAI | dall-e-2 | 256x256, 512x512, 1024x1024 |
| Google Vertex | imagen-3.0-generate-001 | 1:1, 3:4, 4:3, 9:16, 16:9 |
| Google Vertex | imagen-3.0-fast-generate-001 | 1:1, 3:4, 4:3, 9:16, 16:9 |
| Replicate | black-forest-labs/flux-schnell | 1:1, 2:3, 3:2, 4:5, 5:4, 16:9, 9:16, 9:21, 21:9 |
| Replicate | recraft-ai/recraft-v3 | Multiple sizes from 1024x1024 to 2048x1024 |
| Fireworks | Various models | Multiple sizes and ratios depending on model |

### Error Handling

```javascript
const { image, warnings } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'Santa Claus driving a Cadillac',
});
// Check warnings for any issues with unsupported parameters
```

## Provider Management

> Note: Provider management is an experimental feature.

The AI SDK offers custom providers and a provider registry for centralized management of multiple providers and models, allowing access through simple string IDs.

### Custom Providers

Create custom providers using `experimental_customProvider` to:
- Pre-configure model settings
- Provide model name aliases
- Limit available models

#### Custom Model Settings

```javascript
import { openai as originalOpenAI } from '@ai-sdk/openai';
import { experimental_customProvider as customProvider } from 'ai';

export const openai = customProvider({
  languageModels: {
    // replacement model with custom settings:
    'gpt-4o': originalOpenAI('gpt-4o', { structuredOutputs: true }),
    // alias model with custom settings:
    'gpt-4o-mini-structured': originalOpenAI('gpt-4o-mini', {
      structuredOutputs: true,
    }),
  },
  fallbackProvider: originalOpenAI,
});
```

#### Model Name Aliases

```javascript
import { anthropic as originalAnthropic } from '@ai-sdk/anthropic';
import { experimental_customProvider as customProvider } from 'ai';

export const anthropic = customProvider({
  languageModels: {
    opus: originalAnthropic('claude-3-opus-20240229'),
    sonnet: originalAnthropic('claude-3-5-sonnet-20240620'),
    haiku: originalAnthropic('claude-3-haiku-20240307'),
  },
  fallbackProvider: originalAnthropic,
});
```

#### Limited Model Access

```javascript
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { experimental_customProvider as customProvider } from 'ai';

export const myProvider = customProvider({
  languageModels: {
    'text-medium': anthropic('claude-3-5-sonnet-20240620'),
    'text-small': openai('gpt-4o-mini'),
    'structure-medium': openai('gpt-4o', { structuredOutputs: true }),
    'structure-fast': openai('gpt-4o-mini', { structuredOutputs: true }),
  },
  embeddingModels: {
    emdedding: openai.textEmbeddingModel('text-embedding-3-small'),
  },
});
```

### Provider Registry

Create a provider registry to manage multiple providers using `experimental_createProviderRegistry`.

#### Registry Setup

```javascript
// registry.ts
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  // register provider with prefix and default setup:
  anthropic,

  // register provider with prefix and custom setup:
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});
```

#### Using Language Models

Access models using `providerId:modelId` format:

```javascript
import { generateText } from 'ai';
import { registry } from './registry';

const { text } = await generateText({
  model: registry.languageModel('openai:gpt-4-turbo'),
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

#### Using Text Embedding Models

```javascript
import { embed } from 'ai';
import { registry } from './registry';

const { embedding } = await embed({
  model: registry.textEmbeddingModel('openai:text-embedding-3-small'),
  value: 'sunny day at the beach',
});
```

### Best Practices

1. Use custom providers when you need to:
   - Standardize model settings across your application
   - Create aliases for easier model version management
   - Restrict available models for specific use cases

2. Use the provider registry when you need to:
   - Manage multiple providers in a centralized way
   - Access models through consistent string IDs
   - Configure provider-specific settings in one place

## Language Model Middleware

> Note: Language model middleware is an experimental feature.

Language model middleware enables enhancement of model behavior by intercepting and modifying calls to the language model. Common use cases include guardrails, RAG, caching, and logging.

### Basic Usage

```javascript
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

const wrappedLanguageModel = wrapLanguageModel({
  model: yourModel,
  middleware: yourLanguageModelMiddleware,
});

// Use like any other model
const result = streamText({
  model: wrappedLanguageModel,
  prompt: 'What cities are in the United States?',
});
```

### Implementation Options

Middleware can implement three functions to modify language model behavior:
- `transformParams`: Transforms parameters before they reach the model
- `wrapGenerate`: Wraps the `doGenerate` method
- `wrapStream`: Wraps the `doStream` method

### Example Implementations

#### Logging Middleware
```javascript
import type {
  Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware,
  LanguageModelV1StreamPart,
} from 'ai';

export const logMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    console.log('doGenerate called');
    console.log(`params: ${JSON.stringify(params, null, 2)}`);

    const result = await doGenerate();

    console.log('doGenerate finished');
    console.log(`generated text: ${result.text}`);

    return result;
  },

  wrapStream: async ({ doStream, params }) => {
    console.log('doStream called');
    console.log(`params: ${JSON.stringify(params, null, 2)}`);

    const { stream, ...rest } = await doStream();
    let generatedText = '';

    const transformStream = new TransformStream<
      LanguageModelV1StreamPart,
      LanguageModelV1StreamPart
    >({
      transform(chunk, controller) {
        if (chunk.type === 'text-delta') {
          generatedText += chunk.textDelta;
        }
        controller.enqueue(chunk);
      },
      flush() {
        console.log('doStream finished');
        console.log(`generated text: ${generatedText}`);
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};
```

#### Caching Middleware
```javascript
import type { Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware } from 'ai';

const cache = new Map<string, any>();

export const cacheMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const cacheKey = JSON.stringify(params);
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = await doGenerate();
    cache.set(cacheKey, result);
    return result;
  },
};
```

#### RAG (Retrieval Augmented Generation) Middleware
```javascript
import type { Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware } from 'ai';

export const ragMiddleware: LanguageModelV1Middleware = {
  transformParams: async ({ params }) => {
    const lastUserMessageText = getLastUserMessageText({
      prompt: params.prompt,
    });

    if (lastUserMessageText == null) {
      return params;
    }

    const instruction =
      'Use the following information to answer the question:\n' +
      findSources({ text: lastUserMessageText })
        .map(chunk => JSON.stringify(chunk))
        .join('\n');

    return addToLastUserMessage({ params, text: instruction });
  },
};
```

#### Guardrails Middleware
```javascript
import type { Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware } from 'ai';

export const guardrailMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate }) => {
    const { text, ...rest } = await doGenerate();
    const cleanedText = text?.replace(/badword/g, '<REDACTED>');
    return { text: cleanedText, ...rest };
  },
};
```

### Best Practices

1. **Middleware Composition**
   - Keep middleware focused on single responsibilities
   - Combine multiple middleware for complex functionality
   - Consider the order of middleware application

2. **Error Handling**
   - Implement proper error handling in middleware
   - Consider the impact of middleware errors on the application
   - Provide meaningful error messages

3. **Performance**
   - Be mindful of performance impact when implementing middleware
   - Use caching strategically
   - Consider the overhead of multiple middleware layers

## Error Handling

The AI SDK provides several approaches for handling errors in different contexts.

### Regular Error Handling

Use standard try/catch blocks for regular errors:

```javascript
import { generateText } from 'ai';

try {
  const { text } = await generateText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
} catch (error) {
  // handle error
}
```

### Streaming Error Handling

#### Simple Streams
For streams without error chunk support:

```javascript
import { generateText } from 'ai';

try {
  const { textStream } = streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
  
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
} catch (error) {
  // handle error
}
```

#### Advanced Streams with Error Support
For full streams that support error parts:

```javascript
import { generateText } from 'ai';

try {
  const { fullStream } = streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
  
  for await (const part of fullStream) {
    switch (part.type) {
      // ... handle other part types
      case 'error': {
        const error = part.error;
        // handle error
        break;
      }
    }
  }
} catch (error) {
  // handle error
}
```

### Best Practices

1. **Always Include Error Handling**
   - Use try/catch blocks for all AI SDK operations
   - Handle both synchronous and asynchronous errors
   - Consider different types of errors that might occur

2. **Error Type Handling**
   - Check specific error types using SDK error classes
   - Handle each error type appropriately
   - Provide meaningful error messages to users

3. **Stream Error Management**
   - Choose appropriate stream error handling based on your use case
   - Consider both stream-specific errors and general errors
   - Implement proper error recovery strategies

## Testing

Testing language models presents unique challenges due to their non-deterministic nature and the cost/time associated with API calls. The AI SDK Core provides mock providers and test helpers to enable effective unit testing.

### Test Helpers

Import these helpers from `ai/test`:
- `MockEmbeddingModelV1`: Mock embedding model implementation
- `MockLanguageModelV1`: Mock language model implementation
- `mockId`: Provides incrementing integer IDs
- `mockValues`: Iterates over array values
- `simulateReadableStream`: Simulates readable streams with delays

### Example Implementations

#### Testing Text Generation
```javascript
import { generateText } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';

const result = await generateText({
  model: new MockLanguageModelV1({
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 20 },
      text: `Hello, world!`,
    }),
  }),
  prompt: 'Hello, test!',
});
```

#### Testing Text Streaming
```javascript
import { streamText, simulateReadableStream } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';

const result = streamText({
  model: new MockLanguageModelV1({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-delta', textDelta: 'Hello' },
          { type: 'text-delta', textDelta: ', ' },
          { type: 'text-delta', textDelta: `world!` },
          {
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: { completionTokens: 10, promptTokens: 3 },
          },
        ],
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  }),
  prompt: 'Hello, test!',
});
```

#### Testing Object Generation
```javascript
import { generateObject } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';
import { z } from 'zod';

const result = await generateObject({
  model: new MockLanguageModelV1({
    defaultObjectGenerationMode: 'json',
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 20 },
      text: `{"content":"Hello, world!"}`,
    }),
  }),
  schema: z.object({ content: z.string() }),
  prompt: 'Hello, test!',
});
```

#### Testing Object Streaming
```javascript
import { streamObject, simulateReadableStream } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';
import { z } from 'zod';

const result = streamObject({
  model: new MockLanguageModelV1({
    defaultObjectGenerationMode: 'json',
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-delta', textDelta: '{ ' },
          { type: 'text-delta', textDelta: '"content": ' },
          { type: 'text-delta', textDelta: `"Hello, ` },
          { type: 'text-delta', textDelta: `world` },
          { type: 'text-delta', textDelta: `!"` },
          { type: 'text-delta', textDelta: ' }' },
          {
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: { completionTokens: 10, promptTokens: 3 },
          },
        ],
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  }),
  schema: z.object({ content: z.string() }),
  prompt: 'Hello, test!',
});
```

### Testing Data Stream Protocol Responses

Example Next.js route implementation:

```javascript
// route.ts
import { simulateReadableStream } from 'ai';

export async function POST(req: Request) {
  return new Response(
    simulateReadableStream({
      initialDelayInMs: 1000, // Delay before the first chunk
      chunkDelayInMs: 300, // Delay between chunks
      chunks: [
        `0:"This"\n`,
        `0:" is an"\n`,
        `0:"example."\n`,
        `e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n`,
        `d:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n`,
      ],
    }).pipeThrough(new TextEncoderStream()),
    {
      status: 200,
      headers: {
        'X-Vercel-AI-Data-Stream': 'v1',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  );
}
```

### Best Practices

1. **Mock Implementation**
   - Create realistic mock responses
   - Test edge cases and error conditions
   - Simulate various response patterns

2. **Stream Testing**
   - Test different chunk patterns
   - Include delays to simulate real-world conditions
   - Test error handling in streams

3. **Test Coverage**
   - Test all implemented AI SDK features
   - Include both success and failure scenarios
   - Test different model configurations

## Telemetry

> Note: AI SDK Telemetry is experimental and may change in the future.

The AI SDK uses OpenTelemetry for collecting telemetry data, providing standardized instrumentation for observability.

### Basic Configuration

#### Enabling Telemetry
For Next.js applications, follow the Next.js OpenTelemetry guide first, then enable telemetry for specific functions:

```javascript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a short story about a cat.',
  experimental_telemetry: { isEnabled: true },
});
```

#### Telemetry Metadata
Add function identification and custom metadata:

```javascript
const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a short story about a cat.',
  experimental_telemetry: {
    isEnabled: true,
    functionId: 'my-awesome-function',
    metadata: {
      something: 'custom',
      someOtherThing: 'other-value',
    },
  },
});
```

#### Custom Tracer
Use a custom TracerProvider:

```javascript
const tracerProvider = new NodeTracerProvider();
const result = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a short story about a cat.',
  experimental_telemetry: {
    isEnabled: true,
    tracer: tracerProvider.getTracer('ai'),
  },
});
```

### Telemetry Data Collection

#### generateText Function
Records three types of spans:
1. `ai.generateText`
   - Full length of the call
   - Contains basic LLM information
   - Includes operation details and response data

2. `ai.generateText.doGenerate`
   - Provider call details
   - Tool calls information
   - Response data

3. `ai.toolCall`
   - Tool-specific execution details

#### streamText Function
Records spans and events:
1. Spans:
   - `ai.streamText`: Full operation span
   - `ai.streamText.doStream`: Provider streaming span
   - `ai.toolCall`: Tool execution span

2. Events:
   - `ai.stream.firstChunk`
   - `ai.stream.finish`

#### generateObject Function
Records two types of spans:
1. `ai.generateObject`
   - Operation span with schema information
   - Response object details

2. `ai.generateObject.doGenerate`
   - Provider generation details
   - Response and settings information

#### embedMany Function
Records two types of spans:
1. `ai.embedMany`
   - Full embedding operation
   - Multiple values handling

2. `ai.embedMany.doEmbed`
   - Provider embedding details
   - Per-value embedding results

### Span Attributes

#### Basic LLM Span Attributes
Common attributes for LLM operations:
```javascript
{
  'resource.name': string,
  'ai.model.id': string,
  'ai.model.provider': string,
  'ai.request.headers.*': object,
  'ai.settings.maxRetries': number,
  'ai.telemetry.functionId': string,
  'ai.telemetry.metadata.*': object,
  'ai.usage.completionTokens': number,
  'ai.usage.promptTokens': number
}
```

#### Tool Call Span Attributes
Attributes for tool execution:
```javascript
{
  'operation.name': 'ai.toolCall',
  'ai.operationId': 'ai.toolCall',
  'ai.toolCall.name': string,
  'ai.toolCall.id': string,
  'ai.toolCall.args': object,
  'ai.toolCall.result': any
}
```

### Best Practices

1. **Privacy and Performance**
   - Consider disabling input/output recording for sensitive data
   - Use `recordInputs: false` and `recordOutputs: false` when needed
   - Balance telemetry detail with performance impact

2. **Metadata Management**
   - Use consistent function IDs
   - Structure metadata for easy querying
   - Document custom metadata fields

3. **Error Tracking**
   - Monitor finish reasons
   - Track token usage
   - Observe response times and performance metrics

## Additional Resources
For more detailed information, you can refer to:
- AI SDK Core API Reference
- Documentation sections on Generating Text, Structured Data Generation, Tool Calling, and other specific features