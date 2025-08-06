import { NextResponse } from 'next/server';
import { twiml } from 'twilio';

export async function POST(req: Request) {
  const VoiceResponse = twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Forward to Whisper+GPT AI voice
  response.say('Hello! I am your AI order assistant. Please tell me what you want to order.');
  response.record({ timeout: 5, transcribe: true, transcribeCallback: '/api/twilio/transcribe' });

  return new NextResponse(response.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}