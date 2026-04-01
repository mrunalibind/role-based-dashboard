import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyToken, authorizeRoles } from "@/middleware/auth.middleware";
import { hashPassword } from "@/utils/hash";


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const user = await verifyToken(req);
    authorizeRoles(["super-admin"], user.role);

    const body = await req.json();
    const { name, email, phone, password } = body;

    const admin = await User.findById(id);

    if (!admin) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (admin.role !== "admin") {
      return NextResponse.json(
        { message: "User is not an admin" },
        { status: 400 }
      );
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    if (password) {
      admin.password = await hashPassword(password);
    }

    await admin.save();

    return NextResponse.json({
      message: "Admin updated successfully",
      admin,
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

    const user = await verifyToken(req);
    authorizeRoles(["super-admin"], user.role);

    const admin = await User.findById(id);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    await admin.deleteOne();

    return NextResponse.json({
      message: "Admin deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}