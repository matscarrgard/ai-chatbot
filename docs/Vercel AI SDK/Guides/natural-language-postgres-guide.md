# Building a Natural Language Postgres Application

## Overview

This guide walks through building an application that enables natural language interactions with PostgreSQL databases. The application features:

- Natural language to SQL query conversion
- SQL query explanation in plain English
- Data visualization of query results

## Tech Stack

- Next.js 14 (App Router)
- AI SDK
- OpenAI
- Zod
- Vercel Postgres
- shadcn-ui and TailwindCSS
- Recharts

## Initial Setup

### 1. Clone and Configure

```bash
git clone https://github.com/vercel-labs/natural-language-postgres
cd natural-language-postgres
git checkout starter
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Required environment variables:
```env
OPENAI_API_KEY="your_api_key_here"
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NO_SSL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 3. Dataset Setup

1. Download CB Insights Unicorn Companies dataset
2. Save as `unicorns.csv` in project root
3. Initialize database:
```bash
pnpm run seed
```

## Implementation

### 1. SQL Query Generation

#### Create Query Generation Action

```typescript
// app/actions.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const generateQuery = async (input: string) => {
  'use server';
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      system: `You are a SQL (postgres) expert. Your job is to help the user write SQL queries.
        Schema:
        unicorns (
          id SERIAL PRIMARY KEY,
          company VARCHAR(255) NOT NULL UNIQUE,
          valuation DECIMAL(10, 2) NOT NULL,
          date_joined DATE,
          country VARCHAR(255) NOT NULL,
          city VARCHAR(255) NOT NULL,
          industry VARCHAR(255) NOT NULL,
          select_investors TEXT NOT NULL
        );
        
        Rules:
        - Use ILIKE for case-insensitive string matching
        - Convert strings to lowercase using LOWER()
        - Always return quantitative data suitable for charts
        - Include at least two columns in results
        - Return rates as decimals
        - Group time-based data by year`,
      prompt: `Generate the query for: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return result.object.query;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate query');
  }
};
```

### 2. Query Explanation

#### Create Explanation Types

```typescript
// lib/types.ts
import { z } from 'zod';

export const explanationSchema = z.object({
  section: z.string(),
  explanation: z.string(),
});

export type QueryExplanation = z.infer<typeof explanationSchema>;
```

#### Create Explanation Action

```typescript
// app/actions.ts
export const explainQuery = async (input: string, sqlQuery: string) => {
  'use server';
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      system: `You are a SQL expert explaining queries to non-experts.
        Break down each query section with clear explanations.`,
      prompt: `Explain this query in simple terms:
        User Query: ${input}
        SQL Query: ${sqlQuery}`,
      schema: explanationSchema,
      output: 'array',
    });
    return result.object;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate explanation');
  }
};
```

### 3. Data Visualization

#### Chart Configuration Schema

```typescript
// lib/types.ts
export const configSchema = z.object({
  description: z.string(),
  takeaway: z.string(),
  type: z.enum(['bar', 'line', 'area', 'pie']),
  title: z.string(),
  xKey: z.string(),
  yKeys: z.array(z.string()),
  multipleLines: z.boolean().optional(),
  measurementColumn: z.string().optional(),
  lineCategories: z.array(z.string()).optional(),
  colors: z.record(z.string(), z.string()).optional(),
  legend: z.boolean(),
});

export type Config = z.infer<typeof configSchema>;
```

#### Chart Generation Action

```typescript
// app/actions.ts
export const generateChartConfig = async (
  results: Result[],
  userQuery: string,
) => {
  'use server';
  try {
    const { object: config } = await generateObject({
      model: openai('gpt-4o'),
      system: 'You are a data visualization expert.',
      prompt: `Generate chart config for:
        Query: ${userQuery}
        Data: ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    });

    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    return { config: { ...config, colors } };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate chart config');
  }
};
```

### 4. Main Page Implementation

```typescript
// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { generateQuery, generateChartConfig, runGeneratedSQLQuery } from './actions';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [chartConfig, setChartConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const query = await generateQuery(inputValue);
      const data = await runGeneratedSQLQuery(query);
      setResults(data);
      
      const { config } = await generateChartConfig(data, inputValue);
      setChartConfig(config);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ask a question about your data..."
        />
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {results.length > 0 && (
            <Results data={results} chartConfig={chartConfig} />
          )}
        </>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Query Generation
- Provide comprehensive schema information
- Include specific rules for data handling
- Define clear output requirements
- Handle edge cases explicitly

### 2. Data Visualization
- Generate descriptions before configurations
- Use consistent color schemes
- Support multiple chart types
- Include clear takeaways

### 3. Error Handling
- Implement proper error boundaries
- Validate generated SQL
- Handle timeout scenarios
- Provide meaningful error messages

## Performance Optimization

1. **Caching Strategy**
```typescript
import { cache } from 'react';

export const generateQuery = cache(async (input: string) => {
  // Implementation
});
```

2. **Batch Processing**
```typescript
const processBatch = async (queries: string[]) => {
  const results = await Promise.all(
    queries.map(query => runGeneratedSQLQuery(query))
  );
  return results;
};
```

3. **Resource Management**
```typescript
const queryWithTimeout = async (query: string, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const result = await runGeneratedSQLQuery(query, { signal: controller.signal });
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};
```

## Security Considerations

1. **Input Validation**
```typescript
const validateInput = (input: string) => {
  // Check for SQL injection patterns
  const dangerous = /\b(DELETE|DROP|TRUNCATE|ALTER)\b/i;
  if (dangerous.test(input)) {
    throw new Error('Invalid input');
  }
};
```

2. **Query Restrictions**
```typescript
const enforceQueryLimits = (query: string) => {
  if (!query.toLowerCase().startsWith('select')) {
    throw new Error('Only SELECT queries allowed');
  }
};
```

## Extensions and Next Steps

1. Add support for:
   - Multiple databases
   - Custom visualization types
   - Query templates
   - User permissions

2. Enhance features:
   - Query optimization suggestions
   - Advanced data analytics
   - Export functionality
   - Collaborative features

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Recharts Examples](https://recharts.org/en-US/examples)