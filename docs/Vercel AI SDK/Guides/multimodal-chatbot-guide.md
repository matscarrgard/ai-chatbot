# Building a Multi-Modal Chatbot

## Overview

A multi-modal chatbot can understand and process multiple types of inputs, such as text and images. This guide walks through building a chatbot that can handle image uploads and generate text responses based on visual content.

## Prerequisites

- Node.js 18+
- pnpm
- OpenAI API key
- Basic understanding of Next.js

## Project Setup

### Create New Project

```bash
pnpm create next-app@latest multi-modal-chatbot
cd multi-modal-chatbot
```

Note: Select "yes" when prompted to use the App Router.

### Install Dependencies

```bash
pnpm add ai @ai-sdk/openai
```

Ensure you're using ai version 3.2.27 or higher.

### Configure Environment

Create `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key
```

## Implementation

### 1. Create Chat Route Handler

Create `app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 2. Basic Chat Interface

Create `app/page.tsx`:

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

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl"
      >
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

### 3. Add Image Upload Support

Update `app/page.tsx` to handle image uploads:

```typescript
'use client';

import { useChat } from 'ai/react';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
          <div>
            {m?.experimental_attachments
              ?.filter(attachment =>
                attachment?.contentType?.startsWith('image/'),
              )
              .map((attachment, index) => (
                <Image
                  key={`${m.id}-${index}`}
                  src={attachment.url}
                  width={500}
                  height={500}
                  alt={attachment.name ?? `attachment-${index}`}
                />
              ))}
          </div>
        </div>
      ))}

      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });
          setFiles(undefined);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Key Components Explained

### Route Handler
- Handles POST requests to `/api/chat`
- Uses `streamText` for streaming responses
- Processes messages array containing conversation history

### Chat Hook
The `useChat` hook provides:
- `messages`: Current chat messages
- `input`: Current input value
- `handleInputChange`: Input change handler
- `handleSubmit`: Form submission handler
- `isLoading`: Loading state indicator

### Image Handling
- Uses `FileList` for image uploads
- Filters attachments to show only images
- Maintains file input state
- Clears file input after submission

## Best Practices

1. **Error Handling**
   - Validate file types
   - Handle upload failures gracefully
   - Provide user feedback for errors

2. **UI/UX**
   - Show upload progress
   - Preview images before sending
   - Clear feedback for processing state

3. **Performance**
   - Optimize image sizes
   - Consider lazy loading for images
   - Implement request timeouts

## Advanced Features

Consider adding these enhancements:
1. Image compression
2. Drag and drop support
3. Copy-paste image support
4. Multiple file upload progress
5. Image preview before sending

## Running the Application

Start the development server:
```bash
pnpm run dev
```

Access at: `http://localhost:3000`

## Next Steps

1. **Enhanced Image Processing**
   - Add image compression
   - Implement image validation
   - Add file type restrictions

2. **UI Improvements**
   - Add loading states
   - Improve image display
   - Add file upload progress

3. **Feature Additions**
   - Support for more file types
   - Image generation capabilities
   - Response formatting options

## Troubleshooting

Common issues and solutions:

1. **Image Upload Fails**
   - Check file size limits
   - Verify file types
   - Check network connectivity

2. **Messages Not Streaming**
   - Verify OpenAI API key
   - Check rate limits
   - Confirm network stability

3. **UI Issues**
   - Clear browser cache
   - Check console for errors
   - Verify React dependencies

## Resources

- [AI SDK Documentation](link-to-docs)
- [Next.js Documentation](link-to-nextjs)
- [OpenAI API Reference](link-to-openai)
- [Image Processing Guide](link-to-guide)