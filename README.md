# Colvert CopilotKit Runtime Endpoint

A basic CopilotKit runtime server that provides a GraphQL endpoint for AI agents.

## Problem Solved

The original error was caused by trying to import `@langgraph/langgraph/http` which doesn't exist. The correct package is `@langchain/langgraph`, but it doesn't export a `/http` subpath. 

## Solution

1. **Removed the non-existent import**: The `LangGraphHttpAgent` from `@langgraph/langgraph/http` was removed
2. **Used the simple agent**: Switched to using the `createSimpleAgent()` function which is already implemented
3. **Cleaned up dependencies**: Removed the unnecessary `@langchain/langgraph` dependency

## Current Setup

The server now uses a simple agent implementation that:
- Responds to messages with a greeting
- Maintains basic state information
- Is properly integrated with CopilotKit runtime

## Usage

### Start the server:
```bash
npm start
```

### Test the server:
```bash
# Test the hello endpoint
curl -X POST http://localhost:4000/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"query": "query { hello }"}'

# Check available agents
curl -X POST http://localhost:4000/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"query": "query { availableAgents { agents { name } } }"}'
```

## Available GraphQL Queries

- `hello`: Returns a simple greeting
- `availableAgents`: Lists available agents
- `loadAgentState`: Loads agent state

## Available GraphQL Mutations

- `generateCopilotResponse`: Generates responses from agents (requires proper input structure)

## Project Structure

```
src/
├── server.js          # Main server file
└── agents/
    └── simple-agent.js # Simple agent implementation
```

## Dependencies

- `@copilotkit/runtime`: Core CopilotKit runtime functionality

## Next Steps

If you need LangGraph functionality, you can:
1. Use `@langchain/langgraph` for building agents
2. Create custom agents that implement the CopilotKit agent interface
3. Use the LangGraph SDK for HTTP communication with external LangGraph services
