import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyToken } from "@/middleware/auth.middleware";
import { hashPassword } from "@/utils/hash";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const currentUser = verifyToken(req);

    if (currentUser.role === "user") {
      return NextResponse.json(
        { message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const user = await User.findById(id);

    if (!user || user.role !== "user") {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role === "admin" &&
      user.createdBy.toString() !== currentUser.id
    ) {
      return NextResponse.json(
        { message: "Forbidden: Not your user" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const currentUser = verifyToken(req);

    if (currentUser.role === "user") {
      return NextResponse.json(
        { message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const user = await User.findById(id);

    if (!user || user.role !== "user") {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role === "admin" &&
      user.createdBy.toString() !== currentUser.id
    ) {
      return NextResponse.json(
        { message: "Forbidden: Not your user" },
        { status: 403 }
      );
    }

    await user.deleteOne();

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}