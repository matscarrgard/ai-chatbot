# Building a RAG Chatbot with Vercel AI SDK

## Introduction to RAG

### What is RAG?

Retrieval Augmented Generation (RAG) is a technique that enhances Large Language Model (LLM) responses by providing relevant context from a knowledge base. Instead of relying solely on the model's training data, RAG allows LLMs to access and utilize specific information for more accurate and contextual responses.

### Why Use RAG?

Key benefits include:
- Access to information beyond training data
- More accurate and specific responses
- Ability to use proprietary or recent information
- Reduced hallucination

## Core Concepts

### Embeddings

Embeddings are vector representations of text that capture semantic meaning:
- Words/phrases converted to high-dimensional vectors
- Similar meanings have similar vector representations
- Enables semantic search through cosine similarity
- Quality decreases with input length

### Chunking

Breaking down source material into manageable pieces:
- Improves embedding quality
- Enables more precise retrieval
- Common approaches include:
  - Sentence-based splitting
  - Paragraph-based splitting
  - Fixed-length chunks

## Project Implementation

### Tech Stack
- Next.js 14 (App Router)
- AI SDK
- OpenAI
- Drizzle ORM
- Postgres with pgvector
- shadcn-ui and TailwindCSS

### Initial Setup

1. Clone the starter repository:
```bash
git clone https://github.com/vercel/ai-sdk-rag-starter
cd ai-sdk-rag-starter
pnpm install
```

2. Set up environment:
```bash
cp .env.example .env
```

3. Configure database:
```env
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Create Embeddings Table:
```typescript
// lib/db/schema/embeddings.ts
import { generateId } from 'ai';
import { index, pgTable, text, varchar, vector } from 'drizzle-orm/pg-core';
import { resources } from './resources';

export const embeddings = pgTable(
  'embeddings',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    resourceId: varchar('resource_id', { length: 191 }).references(
      () => resources.id,
      { onDelete: 'cascade' },
    ),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  },
  table => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);
```

2. Run migration:
```bash
pnpm db:push
```

### Embedding Implementation

1. Create embedding utilities:
```typescript
// lib/ai/embedding.ts
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const embeddingModel = openai.embedding('text-embedding-ada-002');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  return db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(4);
};
```

### Chat Implementation

1. Create chat route handler:
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';
import { createResource } from '@/lib/actions/resources';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.`,
        parameters: z.object({
          content: z.string().describe('content to add to knowledge base'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}
```

2. Create chat interface:
```typescript
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {'calling tool: ' + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

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

## Features and Capabilities

### Adding Information
- Automatic detection of new information
- Chunking and embedding of content
- Storage in vector database

### Retrieving Information
- Semantic search using embeddings
- Cosine similarity matching
- Multi-step tool calls for refined responses

### User Experience
- Real-time streaming responses
- Tool invocation visibility
- Natural conversation flow

## Best Practices

1. **Chunking Strategy**
   - Consider domain-specific requirements
   - Balance chunk size for embedding quality
   - Maintain context within chunks

2. **Embedding Quality**
   - Use appropriate embedding models
   - Regular validation of embedding quality
   - Monitor similarity thresholds

3. **Performance**
   - Index embeddings for faster search
   - Implement caching where appropriate
   - Monitor and optimize database queries

## Next Steps

- Implement authentication
- Add rate limiting
- Enhance error handling
- Implement persistent chat history
- Add support for file uploads