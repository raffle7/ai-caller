import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/model/Order";
import Restaurant from "@/model/Restaurant";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get restaurant ID for the logged-in user
    const restaurant = await Restaurant.findOne({ userId: session.user.id });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get orders for this restaurant
    const orders = await Order.find({ restaurantId: restaurant._id })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to last 50 orders

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
