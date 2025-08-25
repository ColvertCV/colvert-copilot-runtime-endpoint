// server.mjs (or index.mjs)
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { HttpAgent } from "@ag-ui/client";

// ---- Load envs per environment ----
const ENV = process.env.NODE_ENV || 'development';

// Common defaults
dotenv.config({ path: '.env' });
// Environment-specific
dotenv.config({ path: `.env.${ENV}`, override: true });
// Private local overrides (optional)
dotenv.config({ path: `.env.${ENV}.local`, override: true });

// Validate required vars early
const PORT = Number(process.env.PORT || 4100);
const COPILOT_ENDPOINT = process.env.COPILOT_ENDPOINT || '/copilotkit';
const AGENT_URL = process.env.AGENT_URL;

if (!AGENT_URL) {
  console.error(`[startup] Missing AGENT_URL for NODE_ENV=${ENV}. Check your .env files.`);
  process.exit(1);
}

// Enhanced logging utility (with basic secret scrubbing)
const createLoggingMiddleware = () => {
  return (req, res) => {
    const timestamp = new Date().toISOString();
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    const url = req.url;
    const contentType = req.headers['content-type'] || 'Not specified';

    const redact = (headers) => {
      const clone = { ...headers };
      if (clone.authorization) clone.authorization = '[REDACTED]';
      if (clone.cookie) clone.cookie = '[REDACTED]';
      return clone;
    };

    console.log(`\n🔍 [${timestamp}] NEW REQUEST`);
    console.log(`📍 ${method} ${url}`);
    console.log(`🌐 IP: ${clientIP}`);
    console.log(`🤖 User-Agent: ${userAgent}`);
    console.log(`📋 Content-Type: ${contentType}`);
    console.log(`📋 Headers:`, JSON.stringify(redact(req.headers), null, 2));

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        if (body) {
          try {
            const parsedBody = JSON.parse(body);
            // Redact obvious secrets if present
            if (parsedBody.apiKey) parsedBody.apiKey = '[REDACTED]';
            console.log(`📦 Request Body:`, JSON.stringify(parsedBody, null, 2));
          } catch {
            console.log(`📦 Request Body (raw):`, body);
          }
        }
      });
    }

    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      console.log(`📤 [${timestamp}] RESPONSE`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📏 Content-Length: ${res.getHeader('content-length') || 'Not set'}`);
      if (chunk) {
        try {
          const responseBody = chunk.toString();
          console.log(`📦 Response Body:`, responseBody);
        } catch {
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
  const loggingMiddleware = createLoggingMiddleware();
  loggingMiddleware(req, res);

  const runtime = new CopilotRuntime({
    agents: {
      // Pull from env instead of hardcoding
      sample_agent: new HttpAgent({ url: AGENT_URL }),
    },
  });

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: COPILOT_ENDPOINT,
    runtime,
    serviceAdapter,
  });

  return handler(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 CopilotKit Runtime Server started [${ENV}]`);
  console.log(`📍 Listening at http://localhost:${PORT}${COPILOT_ENDPOINT}`);
  console.log('📊 Request logging enabled - all requests will be logged\n');
});
