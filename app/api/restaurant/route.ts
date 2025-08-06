import { connectDB } from "@/lib/db";
import Restaurant from "@/model/Restaurant";
import { NextResponse } from "next/server";

// POST /api/restaurants
export async function POST(req: Request) {
  const { name, location, menu, twilioNumber } = await req.json();
  await connectDB();
  const restaurant = await Restaurant.create({ name, location, menu, twilioNumber });
  return NextResponse.json(restaurant);
}