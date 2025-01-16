# Vercel AI RSC SDK Documentation

> **Note**: AI SDK RSC is currently experimental. It is recommended to use AI SDK UI for production. For guidance on migrating from RSC to UI, see the migration guide.

## Overview

The `ai/rsc` package is designed to work with frameworks that support React Server Components. React Server Components (RSC) enable server-side rendering and streaming of UI components to the client. Combined with Server Actions, this creates a type-safe way to call server-side code directly from the client. This architecture enables a new approach to building AI applications where large language models (LLMs) can generate and stream UI directly from the server to the client.

## Core Functions

The AI SDK RSC provides several key functions for building AI-native applications with React Server Components:

### Generative UI Functions

- **streamUI**: Calls a model and enables it to respond with React Server Components
- **useUIState**: Returns the current UI state and update function (similar to React's useState). UI State represents the visual representation of the AI state
- **useAIState**: Returns the current AI state and update function (similar to React's useState). AI state contains context and information shared with the AI model, including system messages and function responses
- **useActions**: Provides access to Server Actions from the client, useful for building interfaces requiring user interactions with the server
- **createAI**: Creates a client-server context provider to wrap application sections for managing both UI and AI states

### Streamable Value Functions

- **createStreamableValue**: Creates a stream for sending serializable data from server to client
- **readStreamableValue**: Reads a streamable value on the client that was created using createStreamableValue
- **createStreamableUI**: Creates a stream for sending UI from server to client
- **useStreamableValue**: Accepts a streamable value and returns current value, error, and pending state

## Templates

Available templates demonstrating AI SDK RSC implementation:

1. **Gemini Chatbot**
   - Uses Google Gemini, AI SDK, and Next.js

2. **Generative UI with RSC (experimental)**
   - Uses Next.js, AI SDK, and streamUI
   - Creates generative UIs with React Server Components

## Available Packages

The SDK is divided into several main packages:

- AI SDK Core
- AI SDK UI
- AI SDK RSC
- Stream Helpers
- AI SDK Errors

## Framework Compatibility

The SDK is compatible with:

- Next.js App Router
- Next.js Pages Router
- Svelte
- Nuxt
- Node.js
- Expo

## Streaming React Components

### Overview

The RSC API enables streaming React components from the server to the client using the `streamUI` function. This functionality goes beyond raw text streaming, allowing real-time component delivery to the client. The API supports the same model interfaces as AI SDK Core APIs.

### Basic Usage

```typescript
const result = await streamUI({
  model: openai('gpt-4o'),
  prompt: 'Get the weather for San Francisco',
  text: ({ content }) => <div>{content}</div>,
  tools: {},
});
```

### Working with Tools

Tools in `streamUI` require three key elements:

1. **description**: String explaining the tool's purpose
2. **parameters**: Zod schema defining required inputs
3. **generate**: Async function returning React components

Example with a weather tool:

```typescript
const result = await streamUI({
  model: openai('gpt-4o'),
  prompt: 'Get the weather for San Francisco',
  text: ({ content }) => <div>{content}</div>,
  tools: {
    getWeather: {
      description: 'Get the weather for a location',
      parameters: z.object({ location: z.string() }),
      generate: async function* ({ location }) {
        yield <LoadingComponent />;
        const weather = await getWeather(location);
        return <WeatherComponent weather={weather} location={location} />;
      },
    },
  },
});
```

### Implementation with Next.js

#### 1. Create a Server Action (app/actions.tsx)

```typescript
'use server';

import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const LoadingComponent = () => (
  <div className="animate-pulse p-4">getting weather...</div>
);

const getWeather = async (location: string) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return '82°F️ ☀️';
};

interface WeatherProps {
  location: string;
  weather: string;
}

const WeatherComponent = (props: WeatherProps) => (
  <div className="border border-neutral-200 p-4 rounded-lg max-w-fit">
    The weather in {props.location} is {props.weather}
  </div>
);

export async function streamComponent() {
  const result = await streamUI({
    model: openai('gpt-4o'),
    prompt: 'Get the weather for San Francisco',
    text: ({ content }) => <div>{content}</div>,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          location: z.string(),
        }),
        generate: async function* ({ location }) {
          yield <LoadingComponent />;
          const weather = await getWeather(location);
          return <WeatherComponent weather={weather} location={location} />;
        },
      },
    },
  });

  return result.value;
}
```

#### 2. Create a Page Component (app/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { streamComponent } from './actions';

export default function Page() {
  const [component, setComponent] = useState<React.ReactNode>();

  return (
    <div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setComponent(await streamComponent());
        }}
      >
        <Button>Stream Component</Button>
      </form>
      <div>{component}</div>
    </div>
  );
}
```

### Key Concepts

1. **Generator Functions**: The tool's `generate` function uses a generator pattern (`function*`) to:
   - Yield intermediate states (like loading components)
   - Resume execution after async operations
   - Return final components

2. **State Management**: Components can manage their own state using React hooks while maintaining streaming capabilities

3. **Tool Integration**: Tools can be dynamically called based on the model's understanding of user intent, making the model act as a dynamic router for UI components

## Managing Generative UI State

### Overview

State management in AI applications requires special consideration due to the need to maintain context for large language models (LLMs). While traditional chatbots can use simple message arrays, generative UI applications need to handle non-serializable React components, leading to a dual-state approach.

### State Types

#### AI State
- Serializable format used on the server and shared with the language model
- Contains conversation history and JSON representations of components
- Accessible from both server and client
- Acts as the source of truth for application state

#### UI State
- Client-side state for rendering UI elements
- Can store JavaScript values and React elements
- Only accessible client-side
- Renders the visual representation of AI state

### Implementation

#### 1. Define Types and Create AI Context

```typescript
// app/actions.tsx
export type ServerMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClientMessage = {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
};

export const sendMessage = async (input: string): Promise<ClientMessage> => {
  "use server"
  // Implementation
}

// app/ai.ts
import { createAI } from 'ai/rsc';

export type AIState = ServerMessage[];
export type UIState = ClientMessage[];

export const AI = createAI<AIState, UIState>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    sendMessage,
  },
});
```

#### 2. Set Up Application Context

```typescript
// app/layout.tsx
import { type ReactNode } from 'react';
import { AI } from './ai';

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AI>
      <html lang="en">
        <body>{children}</body>
      </html>
    </AI>
  );
}
```

### State Management Operations

#### 1. Client-Side UI State Management
```typescript
'use client';
import { useUIState } from 'ai/rsc';

export default function Page() {
  const [messages, setMessages] = useUIState();

  return (
    <ul>
      {messages.map(message => (
        <li key={message.id}>{message.display}</li>
      ))}
    </ul>
  );
}
```

#### 2. Client-Side AI State Access
```typescript
'use client';
import { useAIState } from 'ai/rsc';

export default function Page() {
  const [messages, setMessages] = useAIState();
  
  return (
    <ul>
      {messages.map(message => (
        <li key={message.id}>{message.content}</li>
      ))}
    </ul>
  );
}
```

#### 3. Server-Side State Management
```typescript
import { getAIState, getMutableAIState } from 'ai/rsc';

export async function sendMessage(message: string) {
  'use server';
  
  // Read-only state access
  const history = getAIState();
  
  // Mutable state management
  const mutableHistory = getMutableAIState();
  
  // Update state
  mutableHistory.update([...mutableHistory.get(), { 
    role: 'user', 
    content: message 
  }]);
  
  const response = await generateText({
    model: openai('gpt-3.5-turbo'),
    messages: mutableHistory.get(),
  });
  
  // Finalize state update
  mutableHistory.done([...mutableHistory.get(), { 
    role: 'assistant', 
    content: response 
  }]);
  
  return response;
}
```

#### 4. Integrating Server Actions with Client
```typescript
'use client';

import { useActions, useUIState } from 'ai/rsc';
import { AI } from './ai';

export default function Page() {
  const { sendMessage } = useActions<typeof AI>();
  const [messages, setMessages] = useUIState();

  const handleSubmit = async event => {
    event.preventDefault();
    
    // Update UI state with user message
    setMessages([...messages, {
      id: Date.now(),
      role: 'user',
      display: event.target.message.value
    }]);

    // Send message and update UI with response
    const response = await sendMessage(event.target.message.value);
    setMessages([...messages, {
      id: Date.now(),
      role: 'assistant',
      display: response
    }]);
  };

  return (
    <>
      <ul>
        {messages.map(message => (
          <li key={message.id}>{message.display}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

### Key Concepts

1. **Dual State Pattern**: Separation of UI and AI states enables serializable communication with LLMs while maintaining rich UI components

2. **Context Provider**: The `createAI` function creates a context provider that manages both states throughout the application

3. **State Synchronization**: Must manually keep AI and UI states synchronized using appropriate update methods

4. **Server Actions**: All server-side state modifications must occur within actions registered with the AI context

5. **Mutable State Operations**: Use `update()` for intermediate state changes and `done()` for finalizing state updates

## Saving and Restoring States

### Overview

AI SDK RSC provides mechanisms for persisting and restoring both AI and UI states, enabling state preservation across sessions and page reloads.

### AI State Persistence

#### Saving AI State

Use the `onSetAIState` callback to save state when it's updated:

```typescript
export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onSetAIState: async ({ state, done }) => {
    'use server';

    if (done) {
      saveChatToDB(state);
    }
  },
});
```

#### Restoring AI State

Restore state using the `initialAIState` prop on the AI context provider:

```typescript
import { ReactNode } from 'react';
import { AI } from './ai';

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const chat = await loadChatFromDB();

  return (
    <html lang="en">
      <body>
        <AI initialAIState={chat}>{children}</AI>
      </body>
    </html>
  );
}
```

### UI State Management

#### Saving UI State

Since UI state contains non-serializable React components, use the AI state as a proxy for storage. Store component metadata and props in the AI state that can be used to reconstruct UI components.

#### Restoring UI State

Use the `onGetUIState` callback to reconstruct UI state from AI state:

```typescript
export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onGetUIState: async () => {
    'use server';

    const historyFromDB: ServerMessage[] = await loadChatFromDB();
    const historyFromApp: ServerMessage[] = getAIState();

    // Check for state synchronization
    if (historyFromDB.length !== historyFromApp.length) {
      return historyFromDB.map(({ role, content }) => ({
        id: generateId(),
        role,
        display: role === 'function' 
          ? <Component {...JSON.parse(content)} />
          : content
      }));
    }
  },
});
```

### Best Practices

1. **State Synchronization**
   - Always verify AI and UI states are in sync when restoring
   - Handle edge cases where database state differs from application state

2. **Component Reconstruction**
   - Store sufficient metadata in AI state to rebuild UI components
   - Use serializable formats (JSON) for component props

3. **Error Handling**
   - Implement proper error handling for database operations
   - Provide fallback UI states when restoration fails

4. **Performance Considerations**
   - Consider batching state saves to reduce database load
   - Implement efficient state diffing before saving

## Multistep Interfaces

### Overview

Multistep interfaces enable complex user interactions that require multiple sequential steps to complete a task. This pattern is particularly useful for applications like booking systems, form wizards, or interactive chatbots.

### Key Concepts

1. **Tool Composition**
   - Breaking down complex tasks into smaller, manageable steps
   - Combining multiple tools to create comprehensive workflows
   - Example: Flight booking = Search → Select → Book

2. **Application Context**
   - Maintaining state between steps
   - Passing relevant information between tools
   - Managing user inputs and model outputs

### Implementation

#### 1. Basic Setup

```typescript
// app/actions.tsx
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Helper functions
const searchFlights = async (source: string, destination: string, date: string) => {
  return [
    { id: '1', flightNumber: 'AA123' },
    { id: '2', flightNumber: 'AA456' }
  ];
};

const lookupFlight = async (flightNumber: string) => {
  return {
    flightNumber,
    departureTime: '10:00 AM',
    arrivalTime: '12:00 PM'
  };
};

export async function submitUserMessage(input: string) {
  'use server';

  const ui = await streamUI({
    model: openai('gpt-4o'),
    system: 'you are a flight booking assistant',
    prompt: input,
    text: async ({ content }) => <div>{content}</div>,
    tools: {
      searchFlights: {
        description: 'search for flights',
        parameters: z.object({
          source: z.string().describe('The origin of the flight'),
          destination: z.string().describe('The destination of the flight'),
          date: z.string().describe('The date of the flight')
        }),
        generate: async function* ({ source, destination, date }) {
          yield `Searching for flights from ${source} to ${destination} on ${date}...`;
          const results = await searchFlights(source, destination, date);
          return <Flights flights={results} />;
        }
      },
      lookupFlight: {
        description: 'lookup details for a flight',
        parameters: z.object({
          flightNumber: z.string().describe('The flight number')
        }),
        generate: async function* ({ flightNumber }) {
          yield `Looking up details for flight ${flightNumber}...`;
          const details = await lookupFlight(flightNumber);
          return (
            <div>
              <div>Flight Number: {details.flightNumber}</div>
              <div>Departure Time: {details.departureTime}</div>
              <div>Arrival Time: {details.arrivalTime}</div>
            </div>
          );
        }
      }
    }
  });

  return ui.value;
}
```

#### 2. Context Setup

```typescript
// app/ai.ts
import { createAI } from 'ai/rsc';
import { submitUserMessage } from './actions';

export const AI = createAI<any[], React.ReactNode[]>({
  initialUIState: [],
  initialAIState: [],
  actions: {
    submitUserMessage,
  }
});

// app/layout.tsx
import { type ReactNode } from 'react';
import { AI } from './ai';

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AI>
      <html lang="en">
        <body>{children}</body>
      </html>
    </AI>
  );
}
```

#### 3. Interactive Components

```typescript
// components/flights.tsx
'use client';

import { useActions, useUIState } from 'ai/rsc';
import { ReactNode } from 'react';

interface FlightsProps {
  flights: { id: string; flightNumber: string }[];
}

export const Flights = ({ flights }: FlightsProps) => {
  const { submitUserMessage } = useActions();
  const [_, setMessages] = useUIState();

  return (
    <div>
      {flights.map(result => (
        <div key={result.id}>
          <div
            onClick={async () => {
              const display = await submitUserMessage(
                `lookupFlight ${result.flightNumber}`
              );
              setMessages((messages: ReactNode[]) => [...messages, display]);
            }}
          >
            {result.flightNumber}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### 4. Main Page Component

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { AI } from './ai';
import { useActions, useUIState } from 'ai/rsc';

export default function Page() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInput('');
    setConversation(currentConversation => [
      ...currentConversation,
      <div>{input}</div>
    ]);
    const message = await submitUserMessage(input);
    setConversation(currentConversation => [...currentConversation, message]);
  };

  return (
    <div>
      <div>
        {conversation.map((message, i) => (
          <div key={i}>{message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button>Send Message</button>
      </form>
    </div>
  );
}
```

### Best Practices

1. **Tool Design**
   - Keep tools focused on single responsibilities
   - Use clear, descriptive names for tools and parameters
   - Implement proper error handling and loading states

2. **State Management**
   - Maintain clear separation between steps
   - Properly type state to ensure type safety
   - Use appropriate state update patterns

3. **User Experience**
   - Provide clear feedback during transitions
   - Implement proper loading states
   - Enable easy navigation between steps

4. **Error Handling**
   - Implement proper error boundaries
   - Provide clear error messages
   - Enable graceful fallbacks

5. **Performance**
   - Implement efficient state updates
   - Use proper memoization where needed
   - Consider lazy loading for complex components

## Streaming Values

### Overview

The RSC API provides utility functions for streaming values from server to client, offering fine-grained control over streaming behavior. These utilities can be combined with AI SDK Core functions for streaming LLM generations.

### Available Functions

1. **createStreamableValue**
   - Creates a streamable serializable value
   - Provides control over stream creation, updates, and closure
   - Supports strings, numbers, objects, and arrays

2. **createStreamableUI**
   - Creates a streamable React component
   - Enables granular control over component streaming
   - Manages UI updates and state transitions

### Implementing Streamable Values

#### Basic Value Streaming

```typescript
'use server';
import { createStreamableValue } from 'ai/rsc';

export const runThread = async () => {
  const streamableStatus = createStreamableValue('thread.init');

  setTimeout(() => {
    streamableStatus.update('thread.run.create');
    streamableStatus.update('thread.run.update');
    streamableStatus.update('thread.run.end');
    streamableStatus.done('thread.end');
  }, 1000);

  return {
    status: streamableStatus.value,
  };
};
```

#### Reading Streamable Values

```typescript
import { readStreamableValue } from 'ai/rsc';
import { runThread } from '@/actions';

export default function Page() {
  return (
    <button
      onClick={async () => {
        const { status } = await runThread();

        for await (const value of readStreamableValue(status)) {
          console.log(value);
        }
      }}
    >
      Ask
    </button>
  );
}
```

### Implementing Streamable UI

#### Creating Streamable Components

```typescript
// app/actions.tsx
'use server';

import { createStreamableUI } from 'ai/rsc';

export async function getWeather() {
  const weatherUI = createStreamableUI();

  weatherUI.update(<div style={{ color: 'gray' }}>Loading...</div>);

  setTimeout(() => {
    weatherUI.done(<div>It's a sunny day!</div>);
  }, 1000);

  return weatherUI.value;
}
```

#### Consuming Streamable UI

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { getWeather } from '@/actions';

export default function Page() {
  const [weather, setWeather] = useState<React.ReactNode | null>(null);

  return (
    <div>
      <button
        onClick={async () => {
          const weatherUI = await getWeather();
          setWeather(weatherUI);
        }}
      >
        What's the weather?
      </button>

      {weather}
    </div>
  );
}
```

### Common Use Cases

1. **Text Generation Streaming**
   - Real-time LLM output display
   - Progressive text updates
   - Chunked content delivery

2. **Multi-modal Generation**
   - Streaming image generation progress
   - Audio generation buffer updates
   - Video processing status updates

3. **Agent Execution**
   - Progress tracking
   - Step-by-step status updates
   - Error state propagation

### Best Practices

1. **Error Handling**
   - Implement proper error boundaries
   - Handle stream interruptions gracefully
   - Provide fallback UI for failed streams

2. **Performance**
   - Buffer updates when appropriate
   - Implement debouncing for rapid updates
   - Consider chunking large data streams

3. **State Management**
   - Maintain clear stream lifecycle
   - Handle cleanup properly
   - Implement proper state transitions

4. **UI Feedback**
   - Show loading states
   - Provide progress indicators
   - Handle intermediate states gracefully

5. **Resource Management**
   - Close streams when components unmount
   - Clean up subscriptions
   - Handle memory efficiently

## Handling Loading States

### Overview

Loading state management is crucial for AI applications due to potentially lengthy response times from language models. The AI SDK RSC provides three main approaches to handling loading states:

1. Client-side loading state management
2. Server-streamed loading state
3. Streaming loading components

### Client-Side Loading Management

#### Implementation Example

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import { generateResponse } from './actions';
import { readStreamableValue } from 'ai/rsc';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [generation, setGeneration] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
      <div>{generation}</div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          const response = await generateResponse(input);

          let textContent = '';
          for await (const delta of readStreamableValue(response)) {
            textContent = `${textContent}${delta}`;
            setGeneration(textContent);
          }
          
          setInput('');
          setLoading(false);
        }}
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          className="disabled:opacity-50"
          onChange={event => setInput(event.target.value)}
        />
        <button>Send Message</button>
      </form>
    </div>
  );
}

// app/actions.ts
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generateResponse(prompt: string) {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-4o'),
      prompt,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return stream.value;
}
```

### Server-Streamed Loading State

#### Enhanced Implementation

```typescript
// app/actions.ts
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generateResponse(prompt: string) {
  const stream = createStreamableValue();
  const loadingState = createStreamableValue({ loading: true });

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-4o'),
      prompt,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
    loadingState.done({ loading: false });
  })();

  return { 
    response: stream.value, 
    loadingState: loadingState.value 
  };
}

// app/page.tsx
'use client';

import { useState } from 'react';
import { generateResponse } from './actions';
import { readStreamableValue } from 'ai/rsc';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [generation, setGeneration] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
      <div>{generation}</div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          const { response, loadingState } = await generateResponse(input);

          let textContent = '';

          // Handle response stream
          for await (const responseDelta of readStreamableValue(response)) {
            textContent = `${textContent}${responseDelta}`;
            setGeneration(textContent);
          }

          // Handle loading state stream
          for await (const loadingDelta of readStreamableValue(loadingState)) {
            if (loadingDelta) {
              setLoading(loadingDelta.loading);
            }
          }

          setInput('');
          setLoading(false);
        }}
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          className="disabled:opacity-50"
          onChange={event => setInput(event.target.value)}
        />
        <button>Send Message</button>
      </form>
    </div>
  );
}
```

### Streaming Loading Components

#### Implementation with streamUI

```typescript
// app/actions.tsx
'use server';

import { openai } from '@ai-sdk/openai';
import { streamUI } from 'ai/rsc';

export async function generateResponse(prompt: string) {
  const result = await streamUI({
    model: openai('gpt-4o'),
    prompt,
    text: async function* ({ content }) {
      yield <div>loading...</div>;
      return <div>{content}</div>;
    },
  });

  return result.value;
}

// app/page.tsx
'use client';

import { useState } from 'react';
import { generateResponse } from './actions';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [generation, setGeneration] = useState<React.ReactNode>();

  return (
    <div>
      <div>{generation}</div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          const result = await generateResponse(input);
          setGeneration(result);
          setInput('');
        }}
      >
        <input
          type="text"
          value={input}
          onChange={event => setInput(event.target.value)}
        />
        <button>Send Message</button>
      </form>
    </div>
  );
}
```

### Best Practices

1. **User Experience**
   - Always show loading indicators for operations taking longer than 300ms
   - Provide visual feedback for disabled states
   - Consider skeleton loading for complex UI components

2. **Error Handling**
   - Handle loading state errors gracefully
   - Provide clear error messages during loading failures
   - Implement proper error boundaries

3. **Performance**
   - Avoid unnecessary re-renders during loading
   - Implement proper cleanup for loading states
   - Consider debouncing for rapid loading state changes

4. **State Management**
   - Keep loading state logic centralized
   - Handle edge cases (cancellation, timeout)
   - Properly synchronize multiple loading states

5. **Accessibility**
   - Use proper ARIA attributes for loading states
   - Ensure loading indicators are screen-reader friendly
   - Maintain keyboard navigation during loading

## Migrating from RSC to UI

### Background

The AI SDK provides two packages for building frontend applications:
- AI SDK UI: Production-ready, stable package
- AI SDK RSC: Experimental package with React Server Components support

Due to current limitations in RSC technology, the RSC package faces several challenges:
- Stream abortion limitations with server actions
- Component remounting issues with `createStreamableUI` and `streamUI`
- Suspense boundary crashes
- Data transfer inefficiencies
- Stream closure update issues

### Migration Paths

#### 1. Chat Completions Migration

**Before (RSC)**:
```typescript
// app/actions.tsx
import { openai } from '@ai-sdk/openai';
import { getMutableAIState, streamUI } from 'ai/rsc';

export async function sendMessage(message: string) {
  'use server';
  const messages = getMutableAIState('messages');
  messages.update([...messages.get(), { role: 'user', content: message }]);

  const { value: stream } = await streamUI({
    model: openai('gpt-4o'),
    system: 'you are a friendly assistant!',
    messages: messages.get(),
    text: async function* ({ content }) {
      // process text
    }
  });

  return stream;
}
```

**After (UI)**:
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'you are a friendly assistant!',
    messages
  });

  return result.toDataStreamResponse();
}

// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role}</div>
          <div>{message.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

#### 2. Tool Integration Migration

**Before (RSC)**:
```typescript
const { value: stream } = await streamUI({
  tools: {
    displayWeather: {
      description: 'Display the weather',
      parameters: z.object({
        location: z.string()
      }),
      generate: async function* ({ location }) {
        yield <LoadingWeather />;
        const data = await getWeather(location);
        return <Weather data={data} />;
      }
    }
  }
});
```

**After (UI)**:
```typescript
// Route Handler
const result = streamText({
  tools: {
    displayWeather: {
      description: 'Display the weather',
      parameters: z.object({
        location: z.string()
      }),
      execute: async function({ location }) {
        const props = await getWeather(location);
        return props;
      }
    }
  }
});

// Component
function ChatMessage({ message }) {
  return (
    <div>
      {message.toolInvocations?.map(tool => {
        if (tool.state === 'result') {
          return <Weather key={tool.toolCallId} data={tool.result} />;
        }
        return <LoadingWeather key={tool.toolCallId} />;
      })}
    </div>
  );
}
```

#### 3. State Management Migration

**Before (RSC)**:
```typescript
// AI Context
export const AI = createAI({
  initialAIState: [],
  onSetAIState: async ({ state, done }) => {
    'use server';
    if (done) await saveChat(state);
  }
});

// Component
const [messages, setMessages] = useUIState();
```

**After (UI)**:
```typescript
// Route Handler
const result = streamText({
  onFinish: async ({ response }) => {
    await saveChat({
      id,
      messages: [...previousMessages, ...response.messages]
    });
  }
});

// Component
const { messages } = useChat({
  id: chatId,
  initialMessages: await loadChat(chatId)
});
```

### Best Practices for Migration

1. **Phased Migration**
   - Migrate one feature at a time
   - Start with simplest features first
   - Maintain parallel implementations during transition

2. **State Management**
   - Plan state migration strategy upfront
   - Consider data persistence requirements
   - Handle state synchronization carefully

3. **Error Handling**
   - Implement proper error boundaries
   - Test error scenarios thoroughly
   - Maintain error handling parity

4. **Testing**
   - Create test coverage for new implementations
   - Verify feature parity
   - Test edge cases

5. **Performance**
   - Monitor performance metrics during migration
   - Optimize new implementations
   - Address any regressions

## Error Handling

### Overview

The RSC API provides two main categories of error handling:
1. UI streaming errors
2. Value streaming errors

Each type requires different handling strategies and provides specific methods for error management.

### Handling UI Streaming Errors

#### Basic Implementation

```typescript
// app/actions.tsx
'use server';

import { createStreamableUI } from 'ai/rsc';

export async function getStreamedUI() {
  const ui = createStreamableUI();

  (async () => {
    try {
      ui.update(<div>loading</div>);
      const data = await fetchData();
      ui.done(<div>{data}</div>);
    } catch (e) {
      ui.error(<div>Error: {e.message}</div>);
    }
  })();

  return ui.value;
}

// app/page.tsx
import { getStreamedUI } from '@/actions';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export default function Page() {
  const [streamedUI, setStreamedUI] = useState(null);

  return (
    <div>
      <button
        onClick={async () => {
          const newUI = await getStreamedUI();
          setStreamedUI(newUI);
        }}
      >
        Get UI
      </button>
      <ErrorBoundary>{streamedUI}</ErrorBoundary>
    </div>
  );
}
```

### Handling Value Streaming Errors

#### Implementation Example

```typescript
// app/actions.tsx
'use server';

import { createStreamableValue } from 'ai/rsc';
import { fetchData, emptyData } from '../utils/data';

export const getStreamedData = async () => {
  const streamableData = createStreamableValue<string>(emptyData);

  try {
    await (async () => {
      // Stream multiple data updates
      const data1 = await fetchData();
      streamableData.update(data1);

      const data2 = await fetchData();
      streamableData.update(data2);

      const data3 = await fetchData();
      streamableData.done(data3);
    })();

    return { data: streamableData.value };
  } catch (e) {
    return { error: e.message };
  }
};
```

### Error Handling Patterns

1. **Progressive UI Updates with Error States**
```typescript
export async function streamWithProgress() {
  const ui = createStreamableUI();
  
  try {
    // Initial state
    ui.update(<LoadingState step={1} />);
    
    // Process step 1
    await processStep1();
    ui.update(<LoadingState step={2} />);
    
    // Process step 2
    await processStep2();
    ui.done(<SuccessState />);
  } catch (e) {
    ui.error(<ErrorState message={e.message} />);
  }
  
  return ui.value;
}
```

2. **Granular Error Handling**
```typescript
export async function streamWithDetailedErrors() {
  const stream = createStreamableValue();
  
  try {
    for await (const chunk of dataStream) {
      try {
        const processed = await processChunk(chunk);
        stream.update(processed);
      } catch (chunkError) {
        // Handle individual chunk errors
        stream.update({ 
          type: 'warning',
          message: `Chunk process error: ${chunkError.message}`
        });
      }
    }
    stream.done();
  } catch (e) {
    // Handle fatal errors
    stream.update({ 
      type: 'error',
      message: `Fatal error: ${e.message}`
    });
  }
  
  return stream.value;
}
```

### Best Practices

1. **Error Classification**
   - Distinguish between recoverable and fatal errors
   - Categorize errors by source (network, processing, validation)
   - Provide appropriate error context

2. **Error Recovery**
   - Implement retry logic where appropriate
   - Provide fallback content
   - Maintain partial results when possible

3. **User Experience**
   - Display user-friendly error messages
   - Provide clear recovery actions
   - Maintain UI consistency during error states

4. **Error Boundaries**
   - Use React Error Boundaries for UI errors
   - Implement proper error boundary hierarchies
   - Handle errors at appropriate levels

5. **Monitoring and Logging**
   - Log errors with sufficient context
   - Track error patterns
   - Implement error analytics

### Common Error Scenarios

1. **Network Errors**
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
} catch (e) {
  ui.error(<NetworkErrorDisplay error={e} retry={() => retry()} />);
}
```

2. **Validation Errors**
```typescript
try {
  const validated = validateData(data);
  if (!validated.success) {
    throw new ValidationError(validated.errors);
  }
} catch (e) {
  ui.error(<ValidationErrorDisplay errors={e.errors} />);
}
```

3. **Processing Errors**
```typescript
try {
  const processed = await processData(data);
  ui.done(<SuccessDisplay data={processed} />);
} catch (e) {
  ui.error(<ProcessingErrorDisplay error={e} />);
}
```

## Authentication

### Overview

The RSC API relies heavily on Server Actions, which are exposed as public endpoints. This necessitates proper authentication handling to secure your application. Treat Server Actions like public API endpoints and implement appropriate authorization checks.

### Implementation Guide

#### Basic Authentication Check

```typescript
// app/actions.tsx
'use server';

import { cookies } from 'next/headers';
import { createStreamableUI } from 'ai/rsc';
import { validateToken } from '../utils/auth';

export const getWeather = async () => {
  // Get authentication token
  const token = cookies().get('token');

  // Validate authentication
  if (!token || !validateToken(token)) {
    return {
      error: 'This action requires authentication'
    };
  }

  // Proceed with authenticated action
  const streamableDisplay = createStreamableUI(null);
  streamableDisplay.update(<Skeleton />);
  streamableDisplay.done(<Weather />);

  return {
    display: streamableDisplay.value
  };
};
```

### Advanced Authentication Patterns

#### 1. Role-Based Access Control

```typescript
export const getProtectedData = async () => {
  const token = cookies().get('token');
  const user = await validateUserAndRole(token);

  if (!user) {
    return { error: 'Authentication required' };
  }

  if (!user.hasPermission('read:data')) {
    return { error: 'Insufficient permissions' };
  }

  const streamableData = createStreamableUI(null);
  try {
    // Proceed with authorized action
    streamableData.update(<LoadingState />);
    const data = await fetchProtectedData();
    streamableData.done(<DataDisplay data={data} />);
  } catch (e) {
    streamableData.error(<ErrorState error={e} />);
  }

  return { display: streamableData.value };
};
```

#### 2. Session Management

```typescript
export const getSessionData = async () => {
  const session = await getServerSession();
  
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  const streamableUI = createStreamableUI();
  
  try {
    streamableUI.update(<SessionDataLoading />);
    const userData = await fetchUserData(session.user.id);
    streamableUI.done(<UserDashboard data={userData} />);
  } catch (e) {
    streamableUI.error(<SessionError error={e} />);
  }

  return streamableUI.value;
};
```

### Best Practices

1. **Token Validation**
   - Always validate tokens on the server side
   - Implement proper token expiration and refresh mechanisms
   - Use secure token storage methods

2. **Error Handling**
   - Provide clear authentication error messages
   - Implement proper redirect flows for unauthorized access
   - Handle token expiration gracefully

3. **Security Measures**
   - Use HTTPS for all requests
   - Implement rate limiting for authentication endpoints
   - Follow principle of least privilege

4. **Session Management**
   - Implement proper session timeouts
   - Handle concurrent sessions appropriately
   - Clean up expired sessions

5. **Access Control**
   - Implement fine-grained permissions
   - Validate permissions for each sensitive action
   - Log authentication and authorization events

### Common Authentication Scenarios

1. **API Authentication**
```typescript
export const getProtectedApiData = async () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const ui = createStreamableUI();
  
  try {
    ui.update(<Loading />);
    const data = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    ui.done(<ApiData data={await data.json()} />);
  } catch (e) {
    ui.error(<ApiError error={e} />);
  }
  
  return ui.value;
};
```

2. **OAuth Flow**
```typescript
export const handleOAuthCallback = async (code: string) => {
  const ui = createStreamableUI();
  
  try {
    ui.update(<OAuthProcessing />);
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Store tokens securely
    await storeTokens(tokens);
    
    ui.done(<OAuthSuccess />);
  } catch (e) {
    ui.error(<OAuthError error={e} />);
  }
  
  return ui.value;
};
```

3. **Multi-Factor Authentication**
```typescript
export const handleMFAChallenge = async (code: string) => {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: 'No active session' };
  }

  const ui = createStreamableUI();
  
  try {
    ui.update(<MFAVerifying />);
    const verified = await verifyMFACode(session.user.id, code);
    
    if (verified) {
      ui.done(<MFASuccess />);
    } else {
      ui.error(<MFAFailed />);
    }
  } catch (e) {
    ui.error(<MFAError error={e} />);
  }
  
  return ui.value;
};
```