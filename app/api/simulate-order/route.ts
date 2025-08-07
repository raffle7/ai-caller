import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import os from "os";
import { writeFile, unlink } from "fs/promises";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  await connectDB();

  const formData = await req.formData();
  const audio = formData.get("audio");
  const menuJson = formData.get("menu");

  if (!(audio instanceof Blob) || !('arrayBuffer' in audio)) {
    return NextResponse.json({ error: "Invalid audio file" }, { status: 400 });
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
  await writeFile(tempFilePath, buffer);

  try {
    const transcriptRes = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    });

    const transcript = transcriptRes.text;
    const cleanTranscript = transcript.toLowerCase().trim();

    let menu = [];
    if (menuJson) {
      try {
        menu = JSON.parse(menuJson as string);
      } catch (parseError) {
        console.error("Menu JSON parse error:", parseError);
        menu = [];
      }
    } else {
      const restaurant = await Restaurant.findOne();
      if (restaurant?.menu) menu = restaurant.menu;
    }

    const menuItemsArr = Array.isArray(menu)
      ? menu.flatMap((cat: any) =>
          Array.isArray(cat.items) ? cat.items.map((i: any) => i.name) : []
        ).filter(Boolean)
      : [];

    const menuItems = menuItemsArr.join(", ");

    const orderedItem = menuItemsArr.find(item =>
      cleanTranscript.includes(item.toLowerCase())
    );

    const hasOrdered = !!orderedItem;

    // ✅ Function to check for confirmation phrases
    function isConfirmation(text: string): boolean {
      const phrases = [
        "yes", "sure", "yeah", "yep", "please do", "go ahead", "that’s right",
        "correct", "absolutely", "confirm", "sounds good", "okay", "alright",
        "go for it", "do it", "i want it", "place the order", "make it", "book it"
      ];
      return phrases.some(phrase => text.includes(phrase));
    }

    const userConfirmed = isConfirmation(cleanTranscript);

    const prompt = `
You are a food ordering assistant. The available items are: ${menuItemsArr.map((item, i) => `${i + 1}. ${item}`).join("\n")}.
If a user orders something that is NOT on the menu, politely say it's not available.
User: "${transcript}"
`;

    const gptRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful and friendly restaurant assistant." },
        { role: "user", content: prompt },
      ],
    });

    let reply = gptRes.choices[0].message.content || "";

    if (hasOrdered && userConfirmed) {
      reply += `\n\n✅ Your order for **${orderedItem}** has been placed.\n🧾 We'll now show you a receipt.\n\nThank you for your order! 😊`;
    } else if (hasOrdered) {
      reply += `\n\n✅ You said you'd like to order **${orderedItem}**. Should I go ahead and place this order for you?`;
    }

    return NextResponse.json({
      transcript,
      reply,
      orderPlaced: hasOrdered && userConfirmed,
      orderedItem: hasOrdered ? orderedItem : null,
      receipt: hasOrdered && userConfirmed
        ? {
            item: orderedItem,
            price: "$12.00", // You can fetch price dynamically if needed
            status: "Confirmed",
            thankYouNote: "Thank you for your order! 😊"
          }
        : null,
    });
  } catch (error) {
    console.error("OpenAI processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  } finally {
    await unlink(tempFilePath).catch(() => {});
  }
}
