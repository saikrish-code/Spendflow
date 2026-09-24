import { aiTools } from './tools';
import { CoreMessage, streamText, convertToCoreMessages, UIMessage } from 'ai';
import { createGroq } from '@ai-sdk/groq';

// Initialize Groq provider with the provided API key
const groq = createGroq({
  apiKey: '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',
});


export async function processChat(messages: UIMessage[]) {
  // Manually convert UI Messages to Model Messages since ai@7 expects `parts` 
  // which @ai-sdk/react@4.0.115 does not send.
  const coreMessages: CoreMessage[] = [];
  
  for (const msg of messages) {
    if (msg.role === 'user') {
      coreMessages.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'assistant') {
      if (msg.toolInvocations && msg.toolInvocations.length > 0) {
        // Add assistant message with toolCalls
        coreMessages.push({
          role: 'assistant',
          content: msg.content || '',
          toolCalls: msg.toolInvocations.map((t: any) => ({
            type: 'tool-call',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            args: t.args
          }))
        });
        
        // Add tool message with results using ai@7 format (output object)
        const results = msg.toolInvocations.filter((t: any) => t.state === 'result');
        if (results.length > 0) {
          coreMessages.push({
            role: 'tool',
            content: results.map((t: any) => ({
              type: 'tool-result',
              toolCallId: t.toolCallId,
              toolName: t.toolName,
              output: {
                type: 'json',
                value: t.result
              }
            }))
          });
        }
      } else {
        coreMessages.push({ role: 'assistant', content: msg.content });
      }
    }
  }

  const modelMessages = coreMessages;

  const result = await streamText({
    model: groq('openai/gpt-oss-120b'), // Using an available model
    messages: modelMessages,
    tools: aiTools,
    system: `You are SpendFlow Copilot, an AI spend-management assistant. 
    Answer questions concisely using the provided tools. 
    ALWAYS cite bills using the format [BILL-1234] so they render as chips.
    If you cannot find the answer using tools, explicitly state you cannot answer instead of guessing.`
  });
  if (typeof result.toDataStreamResponse === 'function') {
    return result.toDataStreamResponse();
  }
  // @ts-ignore compatibility with newer versions of ai package
  return result.toUIMessageStreamResponse();
}
