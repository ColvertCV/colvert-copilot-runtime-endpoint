import { createServer } from 'node:http';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { HttpAgent } from "@ag-ui/client";

const serviceAdapter = new ExperimentalEmptyAdapter();

const server = createServer((req, res) => {

  const runtime = new CopilotRuntime({
    agents: {
        // Our FastAPI endpoint URL
        'sample_agent': new HttpAgent({url: "http://localhost:8000/your-agent-path"}),
    },
  });

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  });

  return handler(req, res);
});

server.listen(4000, () => {
  console.log('Listening at http://localhost:4000/copilotkit');
});
