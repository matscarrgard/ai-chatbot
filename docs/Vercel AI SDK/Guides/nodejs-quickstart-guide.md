# Node.js Quickstart Guide

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed
- OpenAI API key
- Basic understanding of Node.js and TypeScript

## Project Setup

### Create Project Directory

```bash
mkdir my-ai-app
cd my-ai-app
pnpm init
```

### Install Dependencies

```bash
# Main dependencies
pnpm add ai @ai-sdk/openai zod dotenv

# Development dependencies
pnpm add -D @types/node tsx typescript
```

Note: Ensure you're using ai version 3.1 or higher.

### Configure Environment

Create `.env` file:
```env
OPENAI_API_KEY=xxxxxxxxx
```

## Basic Chatbot Implementation

Create `index.ts` in your project root:

```typescript
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';
import dotenv from 'dotenv';
import * as readline from 'node:readline/promises';

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question('You: ');

    messages.push({ role: 'user', content: userInput });

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
    });

    let fullResponse = '';
    process.stdout.write('\nAssistant: ');
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n\n');

    messages.push({ role: 'assistant', content: fullResponse });
  }
}

main().catch(console.error);
```

### Key Components Explained

1. **Terminal Interface Setup**
   - Uses Node.js readline for interactive terminal input/output
   - Creates persistent interface for ongoing conversation

2. **Message Management**
   - Maintains conversation history in `messages` array
   - Stores both user and assistant messages for context

3. **Stream Processing**
   - Uses `streamText` for real-time response generation
   - Processes response stream incrementally
   - Provides immediate feedback to user

## Enhanced Implementation with Tools

### Weather Tool Example

```typescript
import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText, tool } from 'ai';
import dotenv from 'dotenv';
import { z } from 'zod';
import * as readline from 'node:readline/promises';

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question('You: ');

    messages.push({ role: 'user', content: userInput });

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      tools: {
        weather: tool({
          description: 'Get the weather in a location (in Celsius)',
          parameters: z.object({
            location: z.string().describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: Math.round((Math.random() * 30 + 5) * 10) / 10,
          }),
        }),
        convertCelsiusToFahrenheit: tool({
          description: 'Convert a temperature from Celsius to Fahrenheit',
          parameters: z.object({
            celsius: z.number().describe('The temperature in Celsius to convert'),
          }),
          execute: async ({ celsius }) => {
            const fahrenheit = (celsius * 9) / 5 + 32;
            return { fahrenheit: Math.round(fahrenheit * 100) / 100 };
          },
        }),
      },
      maxSteps: 5,
      onStepFinish: step => {
        console.log(JSON.stringify(step, null, 2));
      },
    });

    let fullResponse = '';
    process.stdout.write('\nAssistant: ');
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n\n');

    messages.push({ role: 'assistant', content: fullResponse });
  }
}

main().catch(console.error);
```

### Tool Implementation Details

1. **Weather Tool**
   - Simulates weather data retrieval
   - Uses Zod for parameter validation
   - Returns temperature in Celsius

2. **Temperature Conversion Tool**
   - Converts between Celsius and Fahrenheit
   - Demonstrates tool chaining capabilities
   - Shows multi-step processing

3. **Multi-step Processing**
   - Uses `maxSteps` for complex interactions
   - Enables tool result incorporation
   - Supports multiple tool calls per response

## Running the Application

```bash
pnpm tsx index.ts
```

## Multi-Step Tool Execution Flow

1. User submits weather query
2. Model calls weather tool
3. Tool executes and returns data
4. Model may call conversion tool
5. Final response incorporates all tool results

## Best Practices

1. **Error Handling**
   - Implement try-catch blocks
   - Handle tool execution failures
   - Manage stream interruptions

2. **Tool Design**
   - Keep tools focused and single-purpose
   - Validate all inputs with Zod
   - Include clear descriptions

3. **Performance**
   - Consider caching tool results
   - Implement timeouts for external calls
   - Monitor response times

## Next Steps

- Implement real API integrations
- Add error handling and logging
- Create custom tools for specific needs
- Explore RAG implementation
- Add persistent storage

## Additional Resources

- [RAG Guide](link-to-rag-guide)
- [Multi-modal Guide](link-to-multimodal-guide)
- [Available Templates](link-to-templates)
- [API Documentation](link-to-api-docs)