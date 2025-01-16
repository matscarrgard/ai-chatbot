# Getting Started with Vercel AI SDK

## Library Overview

The Vercel AI SDK consists of three main components:

1. **AI SDK Core**
   - A unified, provider-agnostic API
   - Used for generating text, structured objects, and tool calls with LLMs
   - Works in any JavaScript environment

2. **AI SDK UI**
   - Framework-agnostic hooks for building chat and generative UIs
   - Production-ready components
   - Supports multiple frontend frameworks

3. **AI SDK RSC** (Experimental)
   - Stream generative UIs with React Server Components
   - Currently experimental - AI SDK UI recommended for production use

## Choosing the Right Tools

### Environment Compatibility Matrix

| Environment | AI SDK Core | AI SDK UI | AI SDK RSC |
|-------------|------------|-----------|------------|
| None / Node.js / Deno | ✓ | | |
| Vue / Nuxt | ✓ | ✓ | |
| Svelte / SvelteKit | ✓ | ✓ | |
| Solid.js / SolidStart | ✓ | ✓ | |
| Next.js Pages Router | ✓ | ✓ | ✓ |
| Next.js App Router | ✓ | ✓ | ✓ |

### AI SDK UI Framework Support

| Function | React | Svelte | Vue.js | SolidJS |
|----------|--------|---------|---------|----------|
| useChat | ✓ | ✓ | ✓ | ✓ |
| useChat tool calling | ✓ | ✓ | ✓ | ✓ |
| useChat attachments | ✓ | | | |
| useCompletion | ✓ | ✓ | ✓ | ✓ |
| useObject | ✓ | | | |
| useAssistant | ✓ | | | |

## When to Use Each Component

### AI SDK Core
- Use when you need direct LLM integration
- Suitable for any JavaScript environment
- Best for backend implementations
- Provides unified API across providers

### AI SDK UI
Recommended for:
- Building production-ready AI applications
- Streaming chat interfaces
- Client-side generative UI
- Cross-framework compatibility
- Common AI interaction patterns (chat, completion, assistant)

Features:
- Full streaming support
- Production-tested reliability
- Framework-agnostic utilities
- Comprehensive tooling for AI interactions

### AI SDK RSC (Experimental)
Current limitations:
- No stream cancellation with Server Actions
- Increased data transfer with `createStreamableUI`
- Component re-mounting issues during streaming
- Limited to React Server Components environments

Best practices:
- Use AI SDK UI for production applications
- Consider for experimental projects
- Useful when server-side rendering is crucial
- Monitor React and Next.js releases for improvements

## Contributing

The AI SDK welcomes contributions, particularly for:
- Implementing missing features in non-React frameworks
- Improving documentation
- Adding new provider integrations
- Bug fixes and performance improvements

## Additional Resources

- [Migration Guide](link-to-migration-guide)
- [Framework-specific Documentation](link-to-framework-docs)
- [API Reference](link-to-api-reference)
- [Examples and Tutorials](link-to-examples)