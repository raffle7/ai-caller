import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db';
import Order from '@/model/Order';
import Restaurant from '@/model/Restaurant';

export async function POST(req: Request) {
  const data = await req.formData();
  const transcript = data.get('TranscriptionText');
  const callSid = data.get('CallSid');
  const from = data.get('From');

  await connectDB();

  // Find the restaurant by Twilio number
  const restaurant = await Restaurant.findOne({ aiNumber: data.get('To') });
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

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
        { 
          role: 'system', 
          content: `You are a restaurant order taker. Parse the customer's order and return a JSON array of items with properties: name, price, quantity (optional), and notes (optional). Use the restaurant's menu prices.`
        },
        { 
          role: 'user', 
          content: transcript 
        }
      ]
    })
  });

  const result = await gptResponse.json();
  const orderItems = JSON.parse(result.choices[0].message.content);
  
  // Calculate total
  const total = orderItems.reduce((sum: number, item: any) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  // Save order to DB
  const order = await Order.create({
    restaurantId: restaurant._id,
    customerNumber: from,
    items: orderItems,
    total,
    transcript: transcript,
    aiResponse: result.choices[0].message.content,
    callSid
  });

  return NextResponse.json({ success: true, order });
}