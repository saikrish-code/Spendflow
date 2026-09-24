import { aiTools } from './tools';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

// Initialize Groq provider with the provided API key
const groq = createGroq({
  apiKey: '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',
});

export async function processChat(messages: any[]) {
  const modelMessages: any[] = [];
  
  if (Array.isArray(messages)) {
    for (const msg of messages) {
      let textContent = '';
      if (typeof msg.content === 'string' && msg.content) {
        textContent = msg.content;
      } else if (Array.isArray(msg.parts)) {
        textContent = msg.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
      } else if (msg.text && typeof msg.text === 'string') {
        textContent = msg.text;
      }

      if (msg.role === 'user') {
        modelMessages.push({ role: 'user', content: textContent || 'Hello' });
      } else if (msg.role === 'assistant') {
        modelMessages.push({ role: 'assistant', content: textContent });
      }
    }
  }

  const result = await streamText({
    model: groq('openai/gpt-oss-120b'),
    messages: modelMessages,
    tools: aiTools,
    system: `You are SpendFlow Copilot, an AI spend-management assistant. 
    Answer questions concisely using the provided tools. 
    ALWAYS cite bills using the format [BILL-1234] so they render as chips.
    If you cannot find the answer using tools, explicitly state you cannot answer instead of guessing.`
  });

  if (typeof (result as any).toDataStreamResponse === 'function') {
    return (result as any).toDataStreamResponse();
  }
  if (typeof (result as any).toUIMessageStreamResponse === 'function') {
    return (result as any).toUIMessageStreamResponse();
  }
  return result.toTextStreamResponse();
}
