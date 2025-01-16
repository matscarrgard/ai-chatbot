# Next.js App Router Quickstart Guide

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- pnpm package manager installed
- OpenAI API key
- Basic understanding of Next.js

## Project Setup

### Create New Application

```bash
pnpm create next-app@latest my-ai-app
cd my-ai-app
```

Note: Select "yes" when prompted to use the App Router.

### Install Dependencies

```bash
pnpm add ai @ai-sdk/openai zod
```

Ensure you're using ai version 3.1 or higher.

### Configure OpenAI API

Create `.env.local` file:

```bash
touch .env.local
```

Add your API key:

```env
OPENAI_API_KEY=xxxxxxxxx
```

## Implementation

### 1. Create Route Handler

Create `app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 2. Create Chat Interface

Update `app/page.tsx`:

```typescript
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Adding Tools

### 1. Weather Tool Implementation

Update `app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: 'Convert a temperature in fahrenheit to celsius',
        parameters: z.object({
          temperature: z
            .number()
            .describe('The temperature in fahrenheit to convert'),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

### 2. Update Chat Interface for Tools

Update `app/page.tsx`:

```typescript
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.toolInvocations ? (
            <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
          ) : (
            <p>{m.content}</p>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Key Concepts

### Route Handler Details
- Handles POST requests to `/api/chat`
- Uses `streamText` for streaming responses
- Configures OpenAI model and processes messages

### Tool Implementation
- Tools extend LLM capabilities
- Can interact with external systems
- Support multi-step interactions
- Use Zod for parameter validation

### Multi-Step Tool Calls
- Enabled via `maxSteps` option
- Allows complex interactions
- Supports multiple tool invocations
- Maintains conversation context

## Running the Application

Start the development server:

```bash
pnpm run dev
```

Access at: `http://localhost:3000`

## Next Steps

After completing this guide, you can:
1. Explore more complex tool implementations
2. Add authentication and rate limiting
3. Implement error handling
4. Add message persistence
5. Customize the chat interface

## Further Resources

- [RAG (Retrieval-augmented generation) guide](link-to-rag-guide)
- [Multi-modal chatbot guide](link-to-multimodal-guide)
- [Available templates](link-to-templates)
- [Full API documentation](link-to-api-docs)