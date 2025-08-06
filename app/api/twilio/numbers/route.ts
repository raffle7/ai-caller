import { NextResponse } from "next/server";
import twilio from "twilio";

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return NextResponse.json({ error: "Twilio credentials missing" }, { status: 500 });
  }
  const client = twilio(accountSid, authToken);
  try {
    // List incoming phone numbers
    const numbers = await client.incomingPhoneNumbers.list();
    const availableNumbers = numbers.map((num) => ({
      sid: num.sid,
      phoneNumber: num.phoneNumber,
      friendlyName: num.friendlyName,
    }));
    return NextResponse.json({ numbers: availableNumbers });
  } catch (error) {
    // Log the full error to the server console for debugging
    // eslint-disable-next-line no-console
    console.error('Twilio API error:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error) {
      if ('message' in error) message = (error as any).message;
      if ('code' in error) message += ` (code: ${(error as any).code})`;
      if ('status' in error) message += ` (status: ${(error as any).status})`;
    }
    return NextResponse.json({ error: message, details: error }, { status: 500 });
  }
}
