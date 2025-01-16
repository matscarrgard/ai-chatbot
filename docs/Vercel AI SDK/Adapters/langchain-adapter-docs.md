# LangChain Adapter

LangChain is a framework for developing applications powered by language models. It provides tools and abstractions for working with:
- AI models
- Agents
- Vector stores
- Data sources for retrieval augmented generation (RAG)

While LangChain provides extensive functionality for working with AI models, it doesn't include built-in UI capabilities or standard streaming methods to the client. The AI SDK's LangChain adapter bridges this gap.

## Example: Completion

Here's a basic example combining the AI SDK and LangChain with the Next.js App Router. The `LangChainAdapter` uses LangChain ExpressionLanguage streaming to pipe text to the client.

### API Route

Create a completion endpoint in `app/api/completion/route.ts`:

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const model = new ChatOpenAI({
    model: 'gpt-3.5-turbo-0125',
    temperature: 0,
  });
  
  const stream = await model.stream(prompt);
  return LangChainAdapter.toDataStreamResponse(stream);
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
1. Setting up a LangChain model with streaming capability
2. Using the LangChainAdapter to convert the stream to a compatible format
3. Implementing a simple UI with real-time completion updates

## Additional Resources

For more examples and implementations, check the AI SDK examples in the `examples/next-langchain` folder.