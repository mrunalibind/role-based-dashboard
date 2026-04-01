import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyToken, authorizeRoles } from "@/middleware/auth.middleware";
import { hashPassword } from "@/utils/hash";

export async function POST(req: Request) {
  try {
    await connectDB();

    const currentUser = await verifyToken(req);

    if (currentUser.role === "user") {
      return NextResponse.json(
        { message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, password, adminId } = body;

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

    let createdBy;

    if (currentUser.role === "super-admin") {
      if (!adminId) {
        return NextResponse.json(
          { message: "adminId is required" },
          { status: 400 }
        );
      }

      const admin = await User.findById(adminId);

      if (!admin || admin.role !== "admin") {
        return NextResponse.json(
          { message: "Invalid adminId" },
          { status: 400 }
        );
      }

      createdBy = adminId;
    }

    if (currentUser.role === "admin") {
      createdBy = currentUser.id;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      createdBy,
    });

    return NextResponse.json({
      message: "User created successfully",
      user,
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

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const currentUser = await verifyToken(req);

    let filter: any = { 
        role: "user",
        name: { $regex: search, $options: "i" },
    };

    if (currentUser.role === "admin") {
      filter.createdBy = currentUser.id;
    }

    if (currentUser.role === "user") {
      return NextResponse.json(
        { message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const users = await User.find(filter).select("-password").skip(skip).limit(limit);

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}