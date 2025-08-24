// Simple test script to verify the server is working
import { createServer } from 'node:http';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { createSimpleAgent } from './src/agents/simple-agent.js';

const serviceAdapter = new ExperimentalEmptyAdapter();

const server = createServer((req, res) => {
  const runtime = new CopilotRuntime({
    agents: {
      'simple-agent': createSimpleAgent(),
    },
  });

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  });

  return handler(req, res);
});

server.listen(4001, () => {
  console.log('Test server listening at http://localhost:4001/copilotkit');
  console.log('You can test it with: curl -X POST http://localhost:4001/copilotkit -H "Content-Type: application/json" -d \'{"query": "query { hello }"}\'');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
