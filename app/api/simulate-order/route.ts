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

   const cleanTranscript = transcript.toLowerCase().trim();
  const orderedItem = menuItemsArr.find(item =>
  cleanTranscript.includes(item.toLowerCase())
  );

    const orderPlaced = !!orderedItem;

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

    let reply = gptRes.choices[0].message.content || "";
    if (orderPlaced) {
      reply += `\n\nOrder placed for: ${orderedItem}.`;
    }

    return NextResponse.json({
      transcript,
      reply,
      orderPlaced,
      orderedItem: orderPlaced ? orderedItem : null,
    });
  } catch (error) {
    console.error("OpenAI processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  } finally {
    await unlink(tempFilePath).catch(() => {});
  }
}
