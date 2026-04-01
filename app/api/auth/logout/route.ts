import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlacklistedToken from "@/models/blacklistedToken.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const expiryDate = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 60 * 60 * 1000);

    await BlacklistedToken.create({ token, expiresAt: expiryDate });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Logout failed" }, { status: 500 });
  }
}
