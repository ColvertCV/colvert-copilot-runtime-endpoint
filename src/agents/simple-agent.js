// Simple CopilotKit agent implementation
export class SimpleAgent {
  constructor() {
    this.name = 'simple-agent';
    this.description = 'A simple example agent';
  }

  // Required method for CopilotKit agents
  async invoke(input) {
    const { messages } = input;
    const lastMessage = messages[messages.length - 1];
    
    // Simple response logic
    const response = {
      content: `Hello! I'm a simple agent. You said: "${lastMessage.content}"`,
      role: 'assistant'
    };

    return {
      messages: [response]
    };
  }

  // Optional: Get agent metadata
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      capabilities: ['text-generation']
    };
  }
}

// Export a factory function to create agent instances
export function createSimpleAgent() {
  return new SimpleAgent();
}
