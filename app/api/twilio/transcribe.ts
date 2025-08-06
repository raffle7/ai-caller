import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.formData();
  const transcript = data.get('TranscriptionText');

  // Send to GPT
  const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Take food orders. Respond friendly. Return items in list.' },
        { role: 'user', content: transcript }
      ]
    })
  });

  const result = await gptResponse.json();
  const orderItems = result.choices[0].message.content;

  // Save order to DB here

  return NextResponse.json({ success: true });
}