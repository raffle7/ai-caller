import { connectDB } from "@/lib/db";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

// POST /api/auth/login
export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  const valid = await compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  return NextResponse.json(user);
}