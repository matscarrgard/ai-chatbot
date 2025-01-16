# Anthropic Provider

The Anthropic provider offers language model support for the Anthropic Messages API.

## Setup

Install the Anthropic provider using your preferred package manager:

```bash
# Using pnpm
pnpm add @ai-sdk/anthropic

# Using npm
npm install @ai-sdk/anthropic

# Using yarn
yarn add @ai-sdk/anthropic
```

## Provider Instance

Import the default provider instance:

```javascript
import { anthropic } from '@ai-sdk/anthropic';
```

For custom configurations, create a provider instance with specific settings:

```javascript
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  // custom settings
});
```

### Configuration Options

- `baseURL` (string): Custom URL prefix for API calls. Default: https://api.anthropic.com/v1
- `apiKey` (string): API key sent in x-api-key header. Default: ANTHROPIC_API_KEY environment variable
- `headers` (Record<string,string>): Custom request headers
- `fetch` (function): Custom fetch implementation

## Language Models

Create a model instance that uses the Anthropic Messages API:

```javascript
const model = anthropic('claude-3-haiku-20240307');
```

### Model Options

- `cacheControl` (boolean): Enable the Anthropic cache control beta

### Example Usage

```javascript
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const { text } = await generateText({
  model: anthropic('claude-3-haiku-20240307'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

Note: When using tool calls with streamObject, the API returns streaming tool calls all at once after a delay instead of streaming incrementally.

## Cache Control

Enable cache control beta with the `cacheControl` option:

```javascript
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const errorMessage = '... long error message ...';

const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20240620', {
    cacheControl: true,
  }),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'You are a JavaScript expert.' },
        {
          type: 'text',
          text: `Error message: ${errorMessage}`,
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: 'ephemeral' } },
          },
        },
        { type: 'text', text: 'Explain the error message.' },
      ],
    },
  ],
});

console.log(result.text);
console.log(result.experimental_providerMetadata?.anthropic);
// e.g. { cacheCreationInputTokens: 2118, cacheReadInputTokens: 0 }
```

Cache control can also be used with system messages:

```javascript
const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20240620', {
    cacheControl: true,
  }),
  messages: [
    {
      role: 'system',
      content: 'Cached system message part',
      experimental_providerMetadata: {
        anthropic: { cacheControl: { type: 'ephemeral' } },
      },
    },
    {
      role: 'system',
      content: 'Uncached system message part',
    },
    {
      role: 'user',
      content: 'User prompt',
    },
  ],
});
```

## Computer Use

Anthropic provides three built-in tools for system interaction:

### Bash Tool

Execute bash commands:

```javascript
const bashTool = anthropic.tools.bash_20241022({
  execute: async ({ command, restart }) => {
    // Implement bash command execution logic
    // Return command execution result
  },
});
```

Parameters:
- `command` (string): Bash command to run (required unless restarting)
- `restart` (boolean): Optional flag to restart the tool

### Text Editor Tool

Manage text files:

```javascript
const textEditorTool = anthropic.tools.textEditor_20241022({
  execute: async ({
    command,
    path,
    file_text,
    insert_line,
    new_str,
    old_str,
    view_range,
  }) => {
    // Implement text editing logic
    // Return editing operation result
  },
});
```

Parameters:
- `command` ('view' | 'create' | 'str_replace' | 'insert' | 'undo_edit'): Operation to perform
- `path` (string): Absolute file or directory path
- `file_text` (string): Content for file creation (required for create command)
- `insert_line` (number): Line number for insertion (required for insert command)
- `new_str` (string): New string for replacement or insertion
- `old_str` (string): String to replace (required for str_replace command)
- `view_range` (number[]): Optional line range for view command

### Computer Tool

Control keyboard and mouse actions:

```javascript
const computerTool = anthropic.tools.computer_20241022({
  displayWidthPx: 1920,
  displayHeightPx: 1080,
  displayNumber: 0, // Optional, for X11 environments

  execute: async ({ action, coordinate, text }) => {
    // Implement computer control logic
    switch (action) {
      case 'screenshot': {
        return {
          type: 'image',
          data: fs.readFileSync('./data/screenshot.png').toString('base64'),
        };
      }
      default: {
        return `executed ${action}`;
      }
    }
  },

  experimental_toToolResultContent(result) {
    return typeof result === 'string'
      ? [{ type: 'text', text: result }]
      : [{ type: 'image', data: result.data, mimeType: 'image/png' }];
  },
});
```

Parameters:
- `action` ('key' | 'type' | 'mouse_move' | 'left_click' | 'left_click_drag' | 'right_click' | 'middle_click' | 'double_click' | 'screenshot' | 'cursor_position'): Action to perform
- `coordinate` (number[]): Coordinates for mouse actions
- `text` (string): Text for type and key actions

## PDF Support

Claude-3-5-sonnet-20241022 supports PDF file processing:

```javascript
const result = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What is an embedding model according to this document?',
        },
        {
          type: 'file',
          data: fs.readFileSync('./data/ai.pdf'),
          mimeType: 'application/pdf',
        },
      ],
    },
  ],
});
```

## Model Capabilities

| Model | Image Input | Object Generation | Tool Usage | Computer Use |
|-------|-------------|-------------------|------------|--------------|
| claude-3-5-sonnet-20241022 | ✓ | ✓ | ✓ | ✓ |
| claude-3-5-sonnet-20240620 | ✓ | ✓ | ✓ | ✓ |
| claude-3-5-haiku-20241022 | ✓ | ✓ | ✓ | ✓ |
| claude-3-opus-20240229 | ✓ | ✓ | ✓ | ✓ |
| claude-3-sonnet-20240229 | ✓ | ✓ | ✓ | ✓ |
| claude-3-haiku-20240307 | ✓ | ✓ | ✓ | ✓ |

For a complete list of available models and their capabilities, refer to the Anthropic documentation. Any available provider model ID can be used as a string when needed.