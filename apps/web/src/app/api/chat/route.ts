import { processChat } from '@/lib/ai/provider';

export const maxDuration = 60;

export async function POST(req: Request) {
  const json = await req.json();
  console.log("INCOMING API CHAT PAYLOAD:", JSON.stringify(json, null, 2));
  const { messages } = json;
  return processChat(messages);
}
