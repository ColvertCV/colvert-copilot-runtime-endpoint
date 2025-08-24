import { createServer } from 'node:http';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { HttpAgent } from "@ag-ui/client";

// Enhanced logging utility
const createLoggingMiddleware = () => {
  return (req, res) => {
    const timestamp = new Date().toISOString();
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    const url = req.url;
    const contentType = req.headers['content-type'] || 'Not specified';
    
    console.log(`\n🔍 [${timestamp}] NEW REQUEST`);
    console.log(`📍 ${method} ${url}`);
    console.log(`🌐 IP: ${clientIP}`);
    console.log(`🤖 User-Agent: ${userAgent}`);
    console.log(`📋 Content-Type: ${contentType}`);
    
    // Log all headers
    console.log(`📋 Headers:`, JSON.stringify(req.headers, null, 2));
    
    // Capture request body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        if (body) {
          try {
            const parsedBody = JSON.parse(body);
            console.log(`📦 Request Body:`, JSON.stringify(parsedBody, null, 2));
          } catch (e) {
            console.log(`📦 Request Body (raw):`, body);
          }
        }
      });
    }
    
    // Log response details
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      console.log(`📤 [${timestamp}] RESPONSE`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📏 Content-Length: ${res.getHeader('content-length') || 'Not set'}`);
      if (chunk) {
        try {
          const responseBody = chunk.toString();
          console.log(`📦 Response Body:`, responseBody);
        } catch (e) {
          console.log(`📦 Response Body (binary/encoded)`);
        }
      }
      console.log(`✅ Request completed\n`);
      originalEnd.call(this, chunk, encoding);
    };
  };
};

const serviceAdapter = new ExperimentalEmptyAdapter();

const server = createServer((req, res) => {
  // Apply logging middleware
  const loggingMiddleware = createLoggingMiddleware();
  loggingMiddleware(req, res);

  const runtime = new CopilotRuntime({
    agents: {
        // Our FastAPI endpoint URL
        'sample_agent': new HttpAgent({url: "https://agents.staging.colvert.ai/your-agent-path"}),
    },
  });

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  });

  return handler(req, res);
});

server.listen(4100, () => {
  console.log('🚀 CopilotKit Runtime Server started');
  console.log('📍 Listening at http://localhost:4100/copilotkit');
  console.log('📊 Request logging enabled - all requests will be logged\n');
});
