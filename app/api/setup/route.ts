import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
    const normalizedMenu = Array.isArray(data.menu)
    ? data.menu.flatMap((group: any) =>
        (group.items || []).map((item: any) => ({
          name: item.name,
          price: Number(item.price),
          description: item.description || "",
          category: group.category || item.category || "Uncategorized",
        }))
      )
    : [];

  const updateData = {
    name: data.name,
    locations: data.locations,
    ownerName: data.ownerName,
    restaurantNumber: data.restaurantNumber,
    aiNumber: data.aiNumber,
    posSystem: data.posSystem,
    posApiKey: data.posApiKey,
    menu: normalizedMenu,
    deals: data.deals,
    language: data.language,
    voice: data.voice,
    accent: data.accent,
    setupComplete: data.setupComplete || false,
    step: data.step,
  };

  const updated = await Restaurant.findOneAndUpdate(
    { userId: session.user.id },
    { $set: updateData },
    { new: true, upsert: true }
  );

  return NextResponse.json({ success: true, restaurant: updated });
}
