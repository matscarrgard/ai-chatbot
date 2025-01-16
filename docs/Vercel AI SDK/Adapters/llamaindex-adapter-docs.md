# LlamaIndex Adapter

LlamaIndex is a framework for building LLM-powered applications that helps you:
- Ingest and structure data
- Access private or domain-specific data
- Build LLM-powered applications

LlamaIndex.TS provides core LlamaIndex features for various runtimes:
- Node.js (official support)
- Vercel Edge Functions (experimental)
- Deno (experimental)

## Example: Completion

Here's a basic example combining the Vercel AI SDK and LlamaIndex with the Next.js App Router. The `LlamaIndexAdapter` uses the stream result from either:
- `chat` method on a LlamaIndex ChatEngine
- `query` method on a LlamaIndex QueryEngine

### API Route

Create a completion endpoint in `app/api/completion/route.ts`:

```typescript
import { OpenAI, SimpleChatEngine } from 'llamaindex';
import { LlamaIndexAdapter } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const llm = new OpenAI({ model: 'gpt-4o' });
  const chatEngine = new SimpleChatEngine({ llm });
  
  const stream = await chatEngine.chat({
    message: prompt,
    stream: true,
  });
  
  return LlamaIndexAdapter.toDataStreamResponse(stream);
}
```

### Frontend Component

Create a page component in `app/page.tsx`:

```typescript
'use client';

import { useCompletion } from 'ai/react';

export default function Chat() {
  const { 
    completion, 
    input, 
    handleInputChange, 
    handleSubmit 
  } = useCompletion();

  return (
    <div>
      {completion}
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange} 
        />
      </form>
    </div>
  );
}
```

The example demonstrates:
1. Setting up a LlamaIndex chat engine with OpenAI
2. Enabling streaming for real-time responses
3. Using the LlamaIndexAdapter to convert the stream
4. Implementing a simple UI with completion updates

## Getting Started

The easiest way to get started with LlamaIndex is using `create-llama`. This tool generates code that uses the Vercel AI SDK to connect with LlamaIndex by default.

### Key Features
- Built-in LlamaIndex integration
- Pre-configured Vercel AI SDK setup
- Ready-to-use example code
- Support for different runtimes

For more complex implementations and custom configurations, refer to the LlamaIndex documentation.