// app/api/simulate-order/route.ts

import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  await connectDB();
  const formData = await req.formData();
  const audio = formData.get("audio");
  const menuJson = formData.get("menu");

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Invalid audio file" }, { status: 400 });
  }

  // Convert Blob to Buffer
  const buffer = Buffer.from(await audio.arrayBuffer());
  const file = new File([buffer], "audio.webm", { type: "audio/webm" });

  // Transcribe audio
  const transcriptRes = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "json",
    language: "en",
  });

  const transcript = transcriptRes.text;

  // Get menu from frontend or database
  let menu = [];
  if (menuJson) {
    try {
      menu = JSON.parse(menuJson as string);
    } catch {
      menu = [];
    }
  } else {
    // If not sent from frontend, get from DB (assuming user is authenticated)
    // You may need to get userId from session or token here
    const restaurant = await Restaurant.findOne(); // You should filter by user/session
    if (restaurant?.menu) menu = restaurant.menu;
  }

  // Compose prompt using real menu
 const menuItems = Array.isArray(menu)
  ? menu
      .flatMap((cat: any) =>
        Array.isArray(cat.items)
          ? cat.items.map((i: any) => i.name)
          : []
      )
      .filter(Boolean)
      .join(", ")
  : "";

console.log("Menu sent to GPT:", menuItems);

const prompt = `
You are a food ordering assistant. The available items are: ${menuItems}.
If a user orders something that is NOT on the menu, politely say it's not available.
User: "${transcript}"
`;

  const gptRes = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a helpful restaurant assistant." },
      { role: "user", content: prompt },
    ],
  });

  const orderedItem = menuItems
  .split(",")
  .map(item => item.trim().toLowerCase())
  .find(item => transcript.toLowerCase().includes(item));

  const orderPlaced = !!orderedItem;

  const reply = gptRes.choices[0].message.content;

  return NextResponse.json({
  transcript,
  reply: orderPlaced
    ? `${reply}\n\nOrder placed for: ${orderedItem}.`
    : reply,
  orderPlaced
});
}
