import { connectDB } from "@/lib/db";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

// POST /api/auth/register
export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();
  const hashed = await hash(password, 10);
  const user = await User.create({ email, password: hashed });
  return NextResponse.json(user);
}