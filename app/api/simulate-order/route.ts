import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";
import OpenAI from "openai";
import { Readable } from "stream";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const restaurant = await Restaurant.findOne({ userId: session.user.id });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("audio") as File;
  if (!file) {
    return NextResponse.json({ error: "No audio uploaded" }, { status: 400 });
  }

  // Convert File to Readable stream for Whisper
  const stream = Readable.from(Buffer.from(await file.arrayBuffer()));

  // Whisper transcription
  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: file
  });

  const transcript = transcription.text;

  // Extract flat list of allowed items
  const allowedItems = restaurant.menu.flatMap((cat: any) =>
    cat.items.map((item: any) => item.name.toLowerCase())
  );

  // GPT conversation
  const gptRes = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You're an AI food assistant for a restaurant named ${restaurant.name}. Only accept orders for the following menu items: ${allowedItems.join(
          ", "
        )}. If the customer asks for something not on the menu, politely inform them it's unavailable.`,
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  });

  const reply = gptRes.choices[0].message.content;

  return NextResponse.json({ transcript, reply });
}
