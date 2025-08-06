import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { NextResponse } from "next/server";
import Restaurant from "@/model/Restaurant";
import { connectDB } from "@/lib/db";
import twilio from "twilio";

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await Restaurant.findOne({ userId: session.user.id });
  
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  try {
    // Make a test call from the AI number to the restaurant number
    const call = await client.calls.create({
      url: `${process.env.PUBLIC_URL}/api/twilio/voice?mode=test`,
      to: restaurant.restaurantNumber,
      from: restaurant.aiNumber
    });

    return NextResponse.json({ 
      success: true, 
      message: "Test call initiated", 
      callId: call.sid 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to make test call", 
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to check call status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get('callId');
  
  if (!callId) {
    return NextResponse.json({ error: "Call ID required" }, { status: 400 });
  }

  try {
    const call = await client.calls(callId).fetch();
    return NextResponse.json({ 
      status: call.status,
      duration: call.duration,
      timestamp: call.startTime
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to fetch call status", 
      details: error.message 
    }, { status: 500 });
  }
}
