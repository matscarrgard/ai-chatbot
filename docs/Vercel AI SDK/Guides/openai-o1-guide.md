# Getting Started with OpenAI o1 Models

## Introduction to o1 Series

OpenAI's o1 series models are designed for enhanced reasoning capabilities, particularly useful for complex tasks in science, coding, and mathematics. The series includes:

- **o1**: Full model with broad general knowledge
- **o1-preview**: Original preview version with streaming support
- **o1-mini**: Faster, cost-effective version for specialized tasks

### Model Capabilities Matrix

| Model | Streaming | Tools | Object Generation | Reasoning Effort |
|-------|-----------|-------|-------------------|------------------|
| o1 | ✓* | ✓ | ✓ | ✓ |
| o1-preview | ✓ | ✗ | ✗ | ✗ |
| o1-mini | ✓ | ✗ | ✗ | ✗ |

*Simulated streaming only

### Performance Benchmarks

- 89th percentile on Codeforces programming questions
- Top 500 US students in USA Math Olympiad qualifier
- Exceeds PhD-level accuracy on physics, biology, and chemistry problems

## Implementation Guide

### Basic Setup

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('o1-mini'),
  prompt: 'Explain quantum entanglement.',
});
```

Note: Requires `@ai-sdk/openai` version 0.0.59 or higher.

### Prompt Engineering Best Practices

1. **Keep Prompts Simple**
```typescript
// Good
const { text } = await generateText({
  model: openai('o1'),
  prompt: 'Explain quantum entanglement.',
});

// Avoid
const { text } = await generateText({
  model: openai('o1'),
  prompt: 'Think step by step and explain your reasoning about quantum entanglement...',
});
```

2. **Use Clear Delimiters**
```typescript
const { text } = await generateText({
  model: openai('o1'),
  prompt: `
    Context: """
    Recent experiments in quantum physics...
    """
    
    Question: What implications do these findings have?
  `
});
```

### Controlling Reasoning Effort

```typescript
const { text } = await generateText({
  model: openai('o1'),
  prompt: 'Explain quantum entanglement briefly.',
  experimental_providerMetadata: {
    openai: {
      reasoningEffort: 'low', // Options: 'low', 'medium', 'high'
    },
  },
});
```

### Structured Data Generation

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { object } = await generateObject({
  model: openai('o1'),
  schema: z.object({
    analysis: z.object({
      title: z.string(),
      key_points: z.array(z.string()),
      confidence_score: z.number(),
    }),
  }),
  prompt: 'Analyze the implications of quantum computing on cryptography.',
});
```

### Tool Implementation

```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { text } = await generateText({
  model: openai('o1'),
  prompt: 'Calculate the performance impact of quantum computing on RSA-2048.',
  tools: {
    calculateQuantumPerformance: tool({
      description: 'Calculate quantum computing performance metrics',
      parameters: z.object({
        algorithm: z.string(),
        key_size: z.number(),
        quantum_bits: z.number(),
      }),
      execute: async ({ algorithm, key_size, quantum_bits }) => {
        // Implementation
        return {
          estimated_break_time: '2.5 hours',
          quantum_advantage: '1000x',
        };
      }),
    }),
  },
});
```

### Building Interactive Chat Interface

1. **Create Route Handler** (`app/api/chat/route.ts`):
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('o1-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

2. **Create Chat Interface** (`app/page.tsx`):
```typescript
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map(m => (
          <div key={m.id} className={`p-4 rounded ${
            m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <div className="font-bold">{m.role === 'user' ? 'You' : 'AI'}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}
```

## Best Practices

### Performance Optimization
1. Use appropriate reasoning effort levels
2. Implement caching for common queries
3. Handle timeouts gracefully

### Error Handling
```typescript
try {
  const { text } = await generateText({
    model: openai('o1'),
    prompt: userInput,
    timeout: 60000, // 60 second timeout
  });
} catch (error) {
  if (error.code === 'TIMEOUT') {
    console.log('Request timed out - model was thinking too long');
  }
  // Handle other errors
}
```

### Resource Management
1. Set appropriate timeouts
2. Implement rate limiting
3. Monitor token usage

## Advanced Features

### Multi-Step Reasoning
```typescript
const { text } = await generateText({
  model: openai('o1'),
  prompt: complexProblem,
  experimental_providerMetadata: {
    openai: {
      reasoningEffort: 'high',
      maxSteps: 5,
    },
  },
});
```

### Hybrid Approaches
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Use different models for different tasks
const quickResponse = await generateText({
  model: openai('o1-mini'),
  prompt: simpleQuery,
});

const complexAnalysis = await generateText({
  model: openai('o1'),
  prompt: complexQuery,
});
```

## Next Steps

1. Explore advanced features:
   - RAG implementation
   - Multi-modal capabilities
   - Custom tool development

2. Consider integrations:
   - Database connections
   - External APIs
   - Authentication systems

3. Performance monitoring:
   - Response times
   - Token usage
   - Error rates

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Example Projects](https://sdk.vercel.ai/examples)
- [Deployment Templates](https://vercel.com/templates?type=ai)