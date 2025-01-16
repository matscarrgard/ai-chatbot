# Vercel AI SDK Documentation

## Overview

The AI SDK UI is designed to help developers build interactive chat, completion, and assistant applications with ease. It functions as a framework-agnostic toolkit that streamlines the integration of advanced AI functionalities into applications.

### Key Features

The SDK provides robust abstractions that simplify complex tasks such as managing chat streams and UI updates on the frontend, enabling more efficient development of dynamic AI-driven interfaces. The toolkit centers around four main hooks:

- **useChat**: Enables real-time streaming of chat messages by abstracting state management for inputs, messages, loading, and errors. This allows for seamless integration into any UI design.

- **useCompletion**: Handles text completions in applications by managing prompt input and automatically updating the UI as new completions are streamed.

- **useObject**: A specialized hook for consuming streamed JSON objects, providing a straightforward way to handle and display structured data in applications.

- **useAssistant**: Facilitates interaction with OpenAI-compatible assistant APIs by managing UI state and automatically updating it as responses are streamed.

These hooks are specifically designed to reduce implementation complexity and development time for AI interactions, allowing developers to focus on creating exceptional user experiences.

## Framework Support

The AI SDK UI supports multiple frameworks with varying levels of functionality:

| Function | React | Svelte | Vue.js | SolidJS |
|----------|--------|---------|---------|----------|
| useChat | ✓ | ✓ | ✓ | ✓ |
| useChat attachments | ✓ | - | - | - |
| useCompletion | ✓ | - | - | - |
| useObject | ✓ | - | - | - |
| useAssistant | ✓ | - | - | - |

Note: The community is welcome to contribute implementations for missing features in non-React frameworks.

## Navigation Structure

### Foundations
- Overview
- Providers and Models
- Prompts
- Tools
- Streaming

### Implementation Guides
- Next.js App Router
- Next.js Pages Router
- Svelte
- Nuxt
- Node.js
- Expo

### Advanced Topics
- RAG Chatbot
- Multi-Modal Chatbot
- Integration with Llama 3.1
- OpenAI Integration
- Computer Use Implementation
- Natural Language Postgres

## Chatbot Implementation

The `useChat` hook provides a streamlined way to create conversational user interfaces for chatbot applications. It handles real-time message streaming, state management, and automatic UI updates.

### Key Features

- **Real-time Message Streaming**: Messages from AI providers are streamed to the chat UI in real-time
- **State Management**: Automatically handles input, messages, loading, and error states
- **Seamless Integration**: Easily integrates into any design or layout with minimal configuration

### Basic Implementation

```tsx
'use client';

import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
```

### API Route Configuration

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Advanced Features

#### Loading State Management
```tsx
const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({});

// Usage in UI
{isLoading && (
  <div>
    <Spinner />
    <button onClick={() => stop()}>Stop</button>
  </div>
)}

<input
  name="prompt"
  value={input}
  onChange={handleInputChange}
  disabled={isLoading}
/>
```

#### Error Handling
```tsx
const { messages, input, handleInputChange, handleSubmit, error, reload } = useChat({});

// Error UI component
{error && (
  <>
    <div>An error occurred.</div>
    <button onClick={() => reload()}>Retry</button>
  </>
)}
```

#### Message Modification
```tsx
const { messages, setMessages } = useChat()

const handleDelete = (id) => {
  setMessages(messages.filter(message => message.id !== id))
}
```

#### Custom Input Control
```tsx
const { input, setInput, append } = useChat()

// Custom input implementation
<MyCustomInput 
  value={input} 
  onChange={value => setInput(value)} 
/>
<MySubmitButton 
  onClick={() => {
    append({
      role: 'user',
      content: input,
    })
  }}
/>
```

### Advanced Configuration

#### Request Configuration
```typescript
const chat = useChat({
  api: '/api/custom-chat',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});
```

#### Event Callbacks
```typescript
const chat = useChat({
  onFinish: (message, { usage, finishReason }) => {
    console.log('Finished streaming message:', message);
    console.log('Token usage:', usage);
    console.log('Finish reason:', finishReason);
  },
  onError: error => {
    console.error('An error occurred:', error);
  },
  onResponse: response => {
    console.log('Received HTTP response:', response);
  },
});
```

#### Performance Optimization
```typescript
const chat = useChat({
  experimental_throttle: 50  // Throttle UI updates to 50ms intervals
});
```

### Attachments Support (Experimental)

The `useChat` hook supports handling file attachments, currently available for React and Vue.js:

#### File Input Implementation
```tsx
const [files, setFiles] = useState<FileList | undefined>(undefined);

// Form submission with files
<form onSubmit={event => {
  handleSubmit(event, {
    experimental_attachments: files,
  });
  setFiles(undefined);
}}>
  <input
    type="file"
    onChange={event => {
      if (event.target.files) {
        setFiles(event.target.files);
      }
    }}
    multiple
  />
</form>
```

#### URL Attachments
```tsx
const [attachments] = useState<Attachment[]>([
  {
    name: 'image.png',
    contentType: 'image/png',
    url: 'https://example.com/image.png',
  }
]);

// Form submission with URL attachments
<form onSubmit={event => {
  handleSubmit(event, {
    experimental_attachments: attachments,
  });
}}>
  // Form content
</form>
```

## Chatbot with Tools

The AI SDK supports integration of tools with the `useChat` hook and `streamText` function. This enables powerful interactions between the chatbot and various tools. 

### Tool Types

The SDK supports three categories of tools:

1. **Server-side Tools**: Automatically executed on the server
2. **Client-side Tools**: Automatically executed in the browser
3. **Interactive Tools**: Require user interaction (e.g., confirmation dialogs)

### Tool Execution Flow

1. User sends a message through the chat UI
2. Message is sent to the API route
3. Language model generates tool calls during `streamText` execution
4. Tool calls are forwarded to the client
5. Tools are executed based on their type:
   - Server-side tools use their `execute` method
   - Automatic client-side tools use the `onToolCall` callback
   - Interactive tools display UI elements for user input
6. Results are managed through the `toolInvocations` property
7. User interactions are handled via `addToolResult`

### Implementation Example

#### API Route Configuration
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      // Server-side tool
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        execute: async ({ city }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        },
      },
      // Interactive client-side tool
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // Automatic client-side tool
      getLocation: {
        description: 'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}
```

#### Client Implementation
```tsx
'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    maxSteps: 5,
    
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'getLocation') {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'San Francisco'];
        return cities[Math.floor(Math.random() * cities.length)];
      }
    },
  });

  return (
    <>
      {messages?.map((m: Message) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.content}
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId;
            const addResult = (result: string) => addToolResult({ toolCallId, result });

            if (toolInvocation.toolName === 'askForConfirmation') {
              return (
                <div key={toolCallId}>
                  {toolInvocation.args.message}
                  {'result' in toolInvocation ? (
                    <b>{toolInvocation.result}</b>
                  ) : (
                    <>
                      <button onClick={() => addResult('Yes')}>Yes</button>
                      <button onClick={() => addResult('No')}>No</button>
                    </>
                  )}
                </div>
              );
            }

            return 'result' in toolInvocation ? (
              <div key={toolCallId}>
                Tool call {`${toolInvocation.toolName}: `}
                {toolInvocation.result}
              </div>
            ) : (
              <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
            );
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  );
}
```

### Advanced Features

#### Tool Call Streaming (Experimental)
Enable real-time streaming of tool calls as they're generated:

```typescript
const result = streamText({
  experimental_toolCallStreaming: true,
  // other options...
});
```

Handle streaming states in the UI:
```tsx
{messages?.map((m: Message) => (
  <div key={m.id}>
    {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
      switch (toolInvocation.state) {
        case 'partial-call':
          return <>render partial tool call</>;
        case 'call':
          return <>render full tool call</>;
        case 'result':
          return <>render tool result</>;
      }
    })}
  </div>
))}
```

#### Server-side Multi-Step Calls
Configure multi-step tool execution for server-side tools:

```typescript
export async function POST(req: Request) {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        execute: async ({ city }) => {
          // Implementation
        },
      },
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
```

#### Error Handling
Customize error handling for tool execution:

```typescript
function errorHandler(error: unknown) {
  if (error == null) return 'unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

const result = streamText({
  // configuration...
});

return result.toDataStreamResponse({
  getErrorMessage: errorHandler,
});
```

For `createDataStreamResponse`, use the `onError` callback:
```typescript
const response = createDataStreamResponse({
  async execute(dataStream) {
    // Implementation
  },
  onError: error => `Custom error: ${error.message}`,
});
```

## Generative User Interfaces

Generative User Interfaces (Generative UI) enable Large Language Models (LLMs) to generate dynamic UI components beyond simple text responses. This creates more engaging and AI-native user experiences by allowing the model to interact with specialized tools and render appropriate UI components based on the context.

### Core Concepts

#### How Generative UI Works

1. Provide the model with context (prompt or conversation history) and available tools
2. Model determines when to use tools based on context
3. Tools execute and return structured data
4. Data is rendered through appropriate React components

### Implementation Guide

#### Basic Setup

1. **Chat Interface Implementation**

```tsx
'use client';

import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'User: ' : 'AI: '}</div>
          <div>{message.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

2. **API Route Configuration**

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
```

### Tool Implementation

#### 1. Define Tools

```typescript
// ai/tools.ts
import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const tools = {
  displayWeather: weatherTool,
};
```

#### 2. Create UI Components

```tsx
// components/weather.tsx
type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  return (
    <div>
      <h2>Current Weather for {location}</h2>
      <p>Condition: {weather}</p>
      <p>Temperature: {temperature}°C</p>
    </div>
  );
};
```

#### 3. Integrate Tools with Chat Interface

```tsx
'use client';

import { useChat } from 'ai/react';
import { Weather } from '@/components/weather';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role === 'user' ? 'User: ' : 'AI: '}</div>
          <div>{message.content}</div>

          <div>
            {message.toolInvocations?.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'displayWeather') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <Weather {...result} />
                    </div>
                  );
                }
              } else {
                return (
                  <div key={toolCallId}>
                    {toolName === 'displayWeather' ? (
                      <div>Loading weather...</div>
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### Advanced Implementation

#### Adding Multiple Tools

1. **Define Additional Tools**
```typescript
// ai/tools.ts
export const stockTool = createTool({
  description: 'Get price for a stock',
  parameters: z.object({
    symbol: z.string().describe('The stock symbol to get the price for'),
  }),
  execute: async function ({ symbol }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});

export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
};
```

2. **Create Corresponding Components**
```tsx
// components/stock.tsx
type StockProps = {
  price: number;
  symbol: string;
};

export const Stock = ({ price, symbol }: StockProps) => {
  return (
    <div>
      <h2>Stock Information</h2>
      <p>Symbol: {symbol}</p>
      <p>Price: ${price}</p>
    </div>
  );
};
```

3. **Update Chat Interface**
```tsx
import { Weather } from '@/components/weather';
import { Stock } from '@/components/stock';

export default function Page() {
  const { messages, input, setInput, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.toolInvocations?.map(toolInvocation => {
            const { toolName, toolCallId, state } = toolInvocation;

            if (state === 'result') {
              switch(toolName) {
                case 'displayWeather':
                  return <Weather key={toolCallId} {...toolInvocation.result} />;
                case 'getStockPrice':
                  return <Stock key={toolCallId} {...toolInvocation.result} />;
                default:
                  return null;
              }
            }

            return (
              <div key={toolCallId}>
                Loading {toolName} data...
              </div>
            );
          })}
        </div>
      ))}

      {/* Form implementation */}
    </div>
  );
}
```

### Best Practices

1. **Tool Design**
   - Keep tool functionality focused and specific
   - Use clear, descriptive names for tools and parameters
   - Implement proper error handling in tool execution
   - Use TypeScript for better type safety

2. **Component Implementation**
   - Create reusable components for each tool's output
   - Implement loading states for better UX
   - Handle error states gracefully
   - Ensure components are responsive

3. **State Management**
   - Use appropriate loading indicators during tool execution
   - Implement proper error handling and user feedback
   - Consider caching tool results for better performance

4. **Security**
   - Validate tool inputs on both client and server
   - Implement proper rate limiting
   - Handle sensitive data appropriately
   - Sanitize tool outputs before rendering

## Completion

The `useCompletion` hook enables text completion functionality in applications with real-time streaming capabilities. It manages input state, handles streaming responses, and automatically updates the UI as completions arrive.

### Basic Implementation

#### Client-Side Component

```tsx
'use client';

import { useCompletion } from 'ai/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/completion',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="prompt"
        value={input}
        onChange={handleInputChange}
        id="input"
      />
      <button type="submit">Submit</button>
      <div>{completion}</div>
    </form>
  );
}
```

#### API Route Handler

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30; // 30-second streaming response limit

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    prompt,
  });

  return result.toDataStreamResponse();
}
```

### Advanced Features

#### State Management

1. **Loading States**
```tsx
const { isLoading } = useCompletion();

return (
  <div>
    {isLoading && <Spinner />}
    {/* Rest of the UI */}
  </div>
);
```

2. **Error Handling**
```tsx
const { error } = useCompletion();

useEffect(() => {
  if (error) {
    toast.error(error.message);
  }
}, [error]);

// Or in the UI:
return (
  <div>
    {error && <div className="error">{error.message}</div>}
    {/* Rest of the UI */}
  </div>
);
```

#### Input Control

1. **Controlled Input**
```tsx
const { input, setInput } = useCompletion();

return (
  <MyCustomInput 
    value={input} 
    onChange={value => setInput(value)} 
  />
);
```

2. **Cancelation Support**
```tsx
const { stop, isLoading } = useCompletion();

return (
  <button 
    onClick={stop} 
    disabled={!isLoading}
  >
    Stop Generation
  </button>
);
```

### Performance Optimization

#### Throttling Updates
```tsx
const { completion } = useCompletion({
  experimental_throttle: 50  // Throttle updates to 50ms intervals
});
```

### Event Handling

#### Lifecycle Callbacks
```typescript
const completion = useCompletion({
  onResponse: (response: Response) => {
    console.log('Server response received:', response);
  },
  onFinish: (message: Message) => {
    console.log('Completion finished:', message);
  },
  onError: (error: Error) => {
    console.error('Error occurred:', error);
  },
});
```

### Request Configuration

#### Custom Request Options
```typescript
const completion = useCompletion({
  api: '/api/custom-completion',
  headers: {
    Authorization: 'Bearer token',
  },
  body: {
    userId: '123',
    customField: 'value',
  },
  credentials: 'same-origin',
});
```

### Best Practices

1. **Error Handling**
   - Implement comprehensive error handling
   - Show user-friendly error messages
   - Provide retry mechanisms when appropriate

2. **Performance**
   - Use throttling for high-frequency updates
   - Implement cancelation for long-running completions
   - Consider implementing request debouncing

3. **User Experience**
   - Show clear loading states
   - Provide feedback for all user actions
   - Implement graceful error recovery

4. **Security**
   - Validate inputs on both client and server
   - Implement proper rate limiting
   - Handle sensitive data appropriately

## Object Generation

> **Note**: `useObject` is an experimental feature currently only available in React.

The `useObject` hook enables the creation of interfaces that work with structured JSON data being streamed in real-time. It's particularly useful for generating and displaying structured data that follows a predefined schema.

### Basic Implementation

#### 1. Schema Definition

```typescript
// app/api/notifications/schema.ts
import { z } from 'zod';

export const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
    }),
  ),
});
```

#### 2. Client-Side Implementation

```tsx
'use client';

import { experimental_useObject as useObject } from 'ai/react';
import { notificationSchema } from './api/notifications/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
  });

  return (
    <>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
```

#### 3. Server-Side Handler

```typescript
// app/api/notifications/route.ts
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: notificationSchema,
    prompt: `Generate 3 notifications for a messages app in this context: ${context}`,
  });

  return result.toTextStreamResponse();
}
```

### Advanced Features

#### State Management

1. **Loading States**
```tsx
const { isLoading } = useObject({
  api: '/api/notifications',
  schema: notificationSchema,
});

return (
  <>
    {isLoading && <Spinner />}
    <button 
      onClick={() => submit('Context')} 
      disabled={isLoading}
    >
      Generate
    </button>
  </>
);
```

2. **Generation Control**
```tsx
const { isLoading, stop } = useObject({
  api: '/api/notifications',
  schema: notificationSchema,
});

return (
  <>
    {isLoading && (
      <button onClick={stop}>
        Stop Generation
      </button>
    )}
  </>
);
```

3. **Error Handling**
```tsx
const { error } = useObject({
  api: '/api/notifications',
  schema: notificationSchema,
});

return (
  <>
    {error && (
      <div className="error">
        An error occurred during generation.
      </div>
    )}
  </>
);
```

### Event Handling

#### Lifecycle Callbacks
```typescript
const objectHandler = useObject({
  api: '/api/notifications',
  schema: notificationSchema,
  onFinish({ object, error }) {
    // Handle completion
    console.log('Generation completed:', object);
    if (error) {
      console.error('Schema validation failed:', error);
    }
  },
  onError(error) {
    // Handle fetch/network errors
    console.error('Request failed:', error);
  },
});
```

### Configuration Options

#### Custom Request Setup
```typescript
const { submit, object } = useObject({
  api: '/api/custom-endpoint',
  headers: {
    'Authorization': 'Bearer token',
    'X-Custom-Header': 'Value',
  },
  schema: customSchema,
});
```

### Best Practices

1. **Schema Design**
   - Define clear, specific schemas
   - Use descriptive field names
   - Include field descriptions for better AI understanding
   - Handle optional fields appropriately

2. **Error Handling**
   - Implement comprehensive error handling
   - Show user-friendly error messages
   - Handle schema validation errors gracefully
   - Provide clear feedback for network issues

3. **Performance**
   - Handle partial data updates smoothly
   - Implement loading states
   - Provide cancellation options
   - Consider data caching strategies

4. **User Experience**
   - Show clear loading indicators
   - Implement graceful fallbacks
   - Handle undefined/null values
   - Provide feedback for all user actions

### Limitations

1. Currently only available in React
2. Experimental feature - API may change
3. Requires careful handling of partial data
4. Schema validation happens after completion

## OpenAI Assistants

The `useAssistant` hook manages client state for interactions with OpenAI-compatible assistant APIs. It provides automatic UI updates during assistant execution and streaming. The hook is available across multiple frameworks including React, Svelte, and Vue.js.

### Basic Implementation

#### Client Component
```tsx
'use client';

import { Message, useAssistant } from 'ai/react';

export default function Chat() {
  const { status, messages, input, submitMessage, handleInputChange } = useAssistant({
    api: '/api/assistant'
  });

  return (
    <div>
      {messages.map((m: Message) => (
        <div key={m.id}>
          <strong>{`${m.role}: `}</strong>
          {m.role !== 'data' ? (
            m.content
          ) : (
            <>
              {(m.data as any).description}
              <pre className="bg-gray-200">
                {JSON.stringify(m.data, null, 2)}
              </pre>
            </>
          )}
        </div>
      ))}

      {status === 'in_progress' && <div>Processing...</div>}

      <form onSubmit={submitMessage}>
        <input
          disabled={status !== 'awaiting_message'}
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
        />
      </form>
    </div>
  );
}
```

#### API Route Configuration
```typescript
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { threadId, message } = await req.json();

  // Create or use existing thread
  const currentThreadId = threadId ?? (await openai.beta.threads.create({})).id;

  // Add message to thread
  const createdMessage = await openai.beta.threads.messages.create(currentThreadId, {
    role: 'user',
    content: message,
  });

  return AssistantResponse(
    { threadId: currentThreadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      const runStream = openai.beta.threads.runs.stream(currentThreadId, {
        assistant_id: process.env.ASSISTANT_ID ?? 
          (() => { throw new Error('ASSISTANT_ID not configured'); })(),
      });

      let runResult = await forwardStream(runStream);

      // Handle tool actions if required
      while (
        runResult?.status === 'requires_action' &&
        runResult.required_action?.type === 'submit_tool_outputs'
      ) {
        const tool_outputs = runResult.required_action.submit_tool_outputs.tool_calls.map(
          (toolCall: any) => {
            const parameters = JSON.parse(toolCall.function.arguments);
            
            // Tool implementation logic here
            throw new Error(`Unhandled tool: ${toolCall.function.name}`);
          }
        );

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            currentThreadId,
            runResult.id,
            { tool_outputs }
          )
        );
      }
    }
  );
}
```

### Advanced Features

#### State Management

1. **Status Tracking**
```tsx
const { status } = useAssistant({ api: '/api/assistant' });

return (
  <div>
    {status === 'in_progress' && <Spinner />}
    {status === 'awaiting_message' && 'Ready for input'}
  </div>
);
```

2. **Error Handling**
```tsx
const { error } = useAssistant({ api: '/api/assistant' });

useEffect(() => {
  if (error) {
    toast.error('Assistant error: ' + error.message);
  }
}, [error]);

// Or in the UI:
return error && <ErrorAlert message={error.message} />;
```

#### Input Control

1. **Manual Message Control**
```tsx
const { append } = useAssistant();

return (
  <CustomInput
    onSubmit={(content) => {
      append({
        role: 'user',
        content,
      });
    }}
  />
);
```

2. **Custom Request Configuration**
```typescript
const assistant = useAssistant({
  api: '/api/custom-assistant',
  headers: {
    Authorization: 'Bearer token',
  },
  body: {
    userId: '123',
    metadata: { key: 'value' },
  },
  credentials: 'same-origin',
});
```

### Message Types

1. **Standard Messages**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

2. **Data Messages**
```typescript
interface DataMessage {
  id: string;
  role: 'data';
  data: unknown;
}
```

### Best Practices

1. **Error Handling**
   - Implement comprehensive error handling
   - Show user-friendly error messages
   - Handle network issues gracefully
   - Provide clear feedback for API errors

2. **State Management**
   - Track assistant status appropriately
   - Handle loading states
   - Manage input state carefully
   - Implement proper error recovery

3. **Security**
   - Secure API endpoints
   - Validate all inputs
   - Implement rate limiting
   - Handle sensitive data appropriately

4. **Performance**
   - Implement proper streaming
   - Handle long-running operations
   - Consider implementing timeouts
   - Cache results when appropriate

### Cross-Framework Support

The `useAssistant` hook is available in multiple frameworks:

- React: `import { useAssistant } from 'ai/react'`
- Svelte: `import { useAssistant } from 'ai/svelte'`
- Vue.js: `import { useAssistant } from 'ai/vue'`

## Storing Messages

The AI SDK provides built-in capabilities for storing chat history through the `onFinish` callback of the `streamText` function. This callback is executed after the completion of both the model's response and any tool executions, providing access to the final text, tool calls, results, and usage information.

### Implementation Guide

#### API Route Implementation

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // Implement storage logic here
      await saveChat({
        text,
        toolCalls,
        toolResults,
        metadata: {
          usage,
          finishReason
        }
      });
    },
  });

  return result.toDataStreamResponse();
}
```

#### Server Action Implementation

```typescript
'use server';

import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';

export async function continueConversation(messages: CoreMessage[]) {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    async onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      await saveChat({
        text,
        toolCalls,
        toolResults,
        metadata: {
          finishReason,
          usage
        }
      });
    },
  });

  return result.toDataStreamResponse();
}
```

### Available Data in onFinish

The `onFinish` callback provides access to several key pieces of information:

1. **text**: The final generated text response
2. **toolCalls**: Any tool calls made during the interaction
3. **toolResults**: Results from executed tools
4. **usage**: Token usage information
5. **finishReason**: Reason for completion of the generation

### Storage Considerations

#### 1. Database Schema
```typescript
interface ChatStorage {
  text: string;
  timestamp: Date;
  toolCalls?: {
    name: string;
    arguments: Record<string, unknown>;
  }[];
  toolResults?: Record<string, unknown>[];
  metadata: {
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finishReason: string;
  };
}
```

#### 2. Storage Implementation Example
```typescript
async function saveChat(data: ChatStorage) {
  try {
    // Example using a hypothetical database client
    await db.chats.create({
      data: {
        ...data,
        timestamp: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to store chat:', error);
    // Implement error handling
  }
}
```

### Best Practices

1. **Error Handling**
   - Implement robust error handling for storage operations
   - Consider retry mechanisms for failed storage attempts
   - Log storage failures appropriately
   - Handle database connection issues gracefully

2. **Performance**
   - Consider implementing batch storage for high-volume scenarios
   - Use appropriate indexing for quick retrieval
   - Consider implementing caching strategies
   - Monitor storage operation performance

3. **Data Management**
   - Implement data retention policies
   - Consider data privacy requirements
   - Implement proper data sanitization
   - Handle large message histories efficiently

4. **Security**
   - Secure sensitive information
   - Implement proper access controls
   - Validate data before storage
   - Consider encryption for sensitive data

### Example Usage Patterns

#### 1. Basic Storage Pattern
```typescript
async function handleChatStorage(chatData) {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: chatData.messages,
    async onFinish(data) {
      await db.transaction(async (tx) => {
        await tx.messages.create(data);
        await tx.metadata.create({
          usage: data.usage,
          finishReason: data.finishReason
        });
      });
    },
  });
}
```

#### 2. With Error Recovery
```typescript
async function handleChatStorageWithRetry(chatData) {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: chatData.messages,
    async onFinish(data) {
      let attempts = 0;
      while (attempts < 3) {
        try {
          await saveChat(data);
          break;
        } catch (error) {
          attempts++;
          if (attempts === 3) {
            console.error('Failed to store chat after 3 attempts');
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    },
  });
}
```

## Streaming Custom Data

The AI SDK provides functionality to stream additional data alongside model responses. This is useful for sending supplementary information such as status updates, message IDs, or content references. The SDK offers several helpers for managing data streams:

- `createDataStream`: Creates a data stream
- `createDataStreamResponse`: Creates a response object that streams data
- `pipeDataStreamToResponse`: Pipes a data stream to a server response object

### Server-Side Implementation

#### Basic Data Streaming Setup

```typescript
import { openai } from '@ai-sdk/openai';
import { generateId, createDataStreamResponse, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: dataStream => {
      // Initial status update
      dataStream.writeData('initialized call');

      const result = streamText({
        model: openai('gpt-4o'),
        messages,
        onChunk() {
          dataStream.writeMessageAnnotation({ chunk: '123' });
        },
        onFinish() {
          // Add message annotation
          dataStream.writeMessageAnnotation({
            id: generateId(),
            metadata: 'additional information',
          });

          // Add call status
          dataStream.writeData('call completed');
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: error => error instanceof Error ? error.message : String(error),
  });
}
```

### Client-Side Implementation

#### Accessing Stream Data

1. **Basic Data Access**
```typescript
import { useChat } from 'ai/react';

function ChatComponent() {
  const { data } = useChat();
  
  return (
    <div>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

2. **Message Annotations**
```typescript
import { Message, useChat } from 'ai/react';

function ChatComponent() {
  const { messages } = useChat();
  
  return (
    <div>
      {messages?.map((m: Message) => (
        <div key={m.id}>
          <div>{m.content}</div>
          {m.annotations && (
            <div className="annotations">
              {JSON.stringify(m.annotations, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Data Management

#### Data Operations

1. **Updating Data**
```typescript
const { setData } = useChat();

// Clear data
setData(undefined);

// Set new data
setData([{ status: 'processing' }]);

// Transform existing data
setData(currentData => [...currentData, { status: 'completed' }]);
```

2. **Clear on Submit Pattern**
```typescript
function ChatComponent() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    data, 
    setData 
  } = useChat();

  return (
    <div>
      <form onSubmit={(e) => {
        setData(undefined); // Clear stream data
        handleSubmit(e);
      }}>
        <input value={input} onChange={handleInputChange} />
      </form>
      
      {messages?.map((m: Message) => (
        <div key={m.id}>{`${m.role}: ${m.content}`}</div>
      ))}
      
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

### Advanced Features

#### Custom Data Stream Handlers

```typescript
export async function POST(req: Request) {
  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Custom stream initialization
      dataStream.writeData({ status: 'initializing' });

      try {
        // Main processing
        const result = await processRequest(req);
        
        // Stream intermediate results
        result.on('progress', (progress) => {
          dataStream.writeData({ status: 'processing', progress });
        });

        // Stream final results
        result.on('complete', (data) => {
          dataStream.writeData({ status: 'completed', data });
        });

      } catch (error) {
        dataStream.writeData({ status: 'error', error: error.message });
      }
    },
    onError: (error) => {
      // Custom error handling
      console.error('Stream error:', error);
      return 'An error occurred during processing';
    }
  });
}
```

### Best Practices

1. **Error Handling**
   - Implement comprehensive error handling
   - Provide clear error messages
   - Handle stream interruptions gracefully
   - Include error recovery mechanisms

2. **Performance**
   - Stream data efficiently
   - Avoid sending unnecessary updates
   - Consider data chunking for large payloads
   - Implement proper cleanup

3. **Data Management**
   - Clear data appropriately
   - Handle state updates efficiently
   - Implement proper data validation
   - Consider data synchronization

4. **User Experience**
   - Show clear loading states
   - Provide progress indicators
   - Handle stream interruptions gracefully
   - Implement proper error feedback

## Error Handling

The AI SDK UI provides comprehensive error handling capabilities through its hooks. Each hook returns an error object that can be used to manage and display error states in your application.

### Basic Error Handling

#### Using Error Object
```tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } = useChat({});

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <div className="error-container">
          <div className="error-message">An error occurred.</div>
          <button 
            type="button" 
            onClick={() => reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={error != null}
        />
      </form>
    </div>
  );
}
```

### Advanced Error Handling Patterns

#### 1. Message Replacement Pattern
```tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const {
    handleInputChange,
    handleSubmit,
    error,
    input,
    messages,
    setMessages
  } = useChat({});

  function customSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (error != null) {
      // Remove last message on error before retrying
      setMessages(messages.slice(0, -1));
    }
    handleSubmit(event);
  }

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <div className="error-notification">
          An error occurred
        </div>
      )}

      <form onSubmit={customSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

#### 2. Error Callback Implementation
```typescript
import { useChat } from 'ai/react';

export default function Page() {
  const chat = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      // Additional error handling logic
      notifyUser(error.message);
    },
  });

  return (
    // Component JSX
  );
}
```

### Testing Error Scenarios

#### 1. Error Injection
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  // Simulate error for testing
  throw new Error('Test error scenario');
}
```

#### 2. Conditional Error Testing
```typescript
export async function POST(req: Request) {
  const { testError } = await req.json();
  
  if (testError) {
    throw new Error('Requested test error');
  }
  
  // Normal processing
}
```

### Best Practices

1. **Error Message Display**
   - Use generic error messages for users
   - Avoid exposing technical details
   - Provide clear recovery actions
   - Consider implementing retry mechanisms

```tsx
function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-message">
        {/* Generic user-friendly message */}
        Something went wrong. Please try again.
      </div>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
      {/* Developer-only error details in development */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="error-details">
          {error.message}
        </pre>
      )}
    </div>
  );
}
```

2. **Error Recovery**
   - Implement graceful degradation
   - Preserve user input when possible
   - Provide clear feedback
   - Include retry functionality

```tsx
function ChatWithRecovery() {
  const {
    messages,
    input,
    error,
    reload,
    setMessages
  } = useChat({
    onError: (error) => {
      // Store last valid state
      localStorage.setItem('lastValidState', JSON.stringify(messages));
    }
  });

  const handleRecovery = async () => {
    const lastValid = localStorage.getItem('lastValidState');
    if (lastValid) {
      setMessages(JSON.parse(lastValid));
    }
    await reload();
  };

  return (
    // Component JSX with recovery handling
  );
}
```

3. **Error Logging**
   - Implement comprehensive error logging
   - Include relevant context
   - Consider error tracking services
   - Maintain privacy considerations

```typescript
const errorLogger = {
  log: (error: Error, context: any) => {
    // Remove sensitive information
    const safeContext = sanitizeContext(context);
    
    console.error('Error:', {
      message: error.message,
      type: error.name,
      context: safeContext,
      timestamp: new Date().toISOString()
    });
  }
};
```

4. **Error Prevention**
   - Validate inputs before submission
   - Implement request timeouts
   - Handle network issues gracefully
   - Consider offline scenarios

```tsx
function ChatWithValidation() {
  const validateInput = (input: string) => {
    if (input.trim().length === 0) {
      throw new Error('Input cannot be empty');
    }
    if (input.length > 1000) {
      throw new Error('Input too long');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      validateInput(input);
      // Proceed with submission
    } catch (error) {
      // Handle validation error
    }
  };

  return (
    // Component JSX
  );
}
```

## Stream Protocols

The AI SDK UI supports two types of streaming protocols for real-time data transmission: Text Streams and Data Streams. These protocols define how data is streamed to the frontend over HTTP.

### Text Stream Protocol

Text streams provide a simple mechanism for streaming plain text chunks that are concatenated to form the complete response. This protocol is supported by `useChat`, `useCompletion`, and `useObject` hooks.

#### Implementation Example

```tsx
// app/page.tsx
'use client';

import { useCompletion } from 'ai/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    streamProtocol: 'text',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="prompt" value={input} onChange={handleInputChange} />
      <button type="submit">Submit</button>
      <div>{completion}</div>
    </form>
  );
}
```

```typescript
// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

### Data Stream Protocol

Data streams follow a specialized protocol for sending structured information to the frontend. Each stream part follows the format: `TYPE_ID:CONTENT_JSON\n`.

#### Stream Part Types

1. **Text Part**
```
Format: 0:string\n
Example: 0:"example"\n
```

2. **Data Part**
```
Format: 2:Array<JSONValue>\n
Example: 2:[{"key":"object1"},{"anotherKey":"object2"}]\n
```

3. **Message Annotation Part**
```
Format: 8:Array<JSONValue>\n
Example: 8:[{"id":"message-123","other":"annotation"}]\n
```

4. **Error Part**
```
Format: 3:string\n
Example: 3:"error message"\n
```

5. **Tool Call Parts**

Tool Call Start:
```
Format: b:{toolCallId:string; toolName:string}\n
Example: b:{"toolCallId":"call-456","toolName":"streaming-tool"}\n
```

Tool Call Delta:
```
Format: c:{toolCallId:string; argsTextDelta:string}\n
Example: c:{"toolCallId":"call-456","argsTextDelta":"partial arg"}\n
```

Tool Call:
```
Format: 9:{toolCallId:string; toolName:string; args:object}\n
Example: 9:{"toolCallId":"call-123","toolName":"my-tool","args":{"some":"argument"}}\n
```

Tool Result:
```
Format: a:{toolCallId:string; result:object}\n
Example: a:{"toolCallId":"call-123","result":"tool output"}\n
```

6. **Finish Parts**

Step Completion:
```
Format: e:{
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  isContinued: boolean;
}\n
```

Message Completion:
```
Format: d:{
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}\n
```

#### Data Stream Implementation

```tsx
// app/page.tsx
'use client';

import { useCompletion } from 'ai/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    streamProtocol: 'data', // Default protocol
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="prompt" value={input} onChange={handleInputChange} />
      <button type="submit">Submit</button>
      <div>{completion}</div>
    </form>
  );
}
```

```typescript
// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    prompt,
  });

  return result.toDataStreamResponse();
}
```

### Best Practices

1. **Protocol Selection**
   - Use text streams for simple text-only applications
   - Use data streams when structured data or tool calls are needed
   - Consider performance implications of protocol choice

2. **Error Handling**
   - Implement proper error handling for stream interruptions
   - Handle malformed stream data gracefully
   - Provide fallback mechanisms for stream failures

3. **Performance**
   - Monitor stream performance
   - Implement appropriate timeouts
   - Consider chunk size optimization
   - Handle backpressure appropriately

4. **Custom Backend Integration**
   - Set `x-vercel-ai-data-stream` header to `v1` for custom backends
   - Follow protocol specifications precisely
   - Implement proper stream closure
   - Handle cross-origin considerations

### Core SDK Components
- Text Generation
- Structured Data Generation
- Tool Calling
- Agents
- Prompt Engineering
- Settings
- Embeddings
- Image Generation
- Provider Management
- Language Model Middleware
- Error Handling
- Testing
- Telemetry