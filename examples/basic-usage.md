# Basic Usage Guide

This guide shows you how to use the CopilotKit runtime server.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Test the server:**
   ```bash
   npm test
   ```

## Server Configuration

The server is configured with:
- **Port**: 4000
- **Endpoint**: `/copilotkit`
- **Service Adapter**: ExperimentalEmptyAdapter
- **Agents**: simple-agent

## Available Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/copilotkit`
- **Method**: POST
- **Content-Type**: application/json

### Example GraphQL Query
```graphql
query {
  agents {
    name
    description
  }
}
```

## Agent Configuration

The server includes a simple example agent. To add more agents:

1. Create a new agent file in `src/agents/`
2. Export the agent class
3. Add it to the agents configuration in `src/server.js`

### Example Agent Structure
```javascript
export class MyAgent {
  constructor() {
    this.name = 'my-agent';
    this.description = 'My custom agent';
  }

  async processMessage(message) {
    // Agent logic here
    return {
      content: 'Response from agent',
      type: 'text'
    };
  }

  getState() {
    return {
      name: this.name,
      status: 'ready'
    };
  }
}
```

## Environment Variables

You can configure the server using environment variables:

```bash
# Server port (default: 4000)
PORT=4000

# Endpoint path (default: /copilotkit)
ENDPOINT_PATH=/copilotkit

# Enable debug logging
DEBUG=true
```

## Development

For development with auto-restart:
```bash
npm run dev
```

## Testing

Test the server:
```bash
npm test
```

## Next Steps

1. **Add Real Agents**: Implement actual agent logic using LangGraph or other frameworks
2. **Configure Service Adapters**: Replace ExperimentalEmptyAdapter with production adapters
3. **Add Authentication**: Implement proper authentication and authorization
4. **Add Monitoring**: Integrate logging and monitoring solutions
5. **Scale**: Consider using load balancers and multiple server instances

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in the server configuration
2. **Module not found**: Run `npm install` to install dependencies
3. **Permission denied**: Ensure you have proper permissions to bind to the port

### Debug Mode

Enable debug logging by setting the DEBUG environment variable:
```bash
DEBUG=true npm start
```
