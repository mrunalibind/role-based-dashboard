import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyToken, authorizeRoles } from "@/middleware/auth.middleware";
import { hashPassword } from "@/utils/hash";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Auth
    const user = verifyToken(req);
    authorizeRoles(["super-admin"], user.role);

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const admin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      createdBy: user.id,
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = verifyToken(req);
    authorizeRoles(["super-admin"], user.role);

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    const skip = (page - 1) * limit;
    
    const admins = await User.find({ role: "admin" }).select("-password").skip(skip).limit(limit);
    const total = await User.countDocuments({ role: "admin" });

    return NextResponse.json({
        total,
        page,
        totalPages: Math.ceil(total / limit),
        admins,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}