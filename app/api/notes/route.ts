import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Note from "@/models/note.model";
import { verifyToken } from "@/middleware/auth.middleware";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await verifyToken(req);

    if (user.role !== "user") {
      return NextResponse.json(
        { message: "Only users can create notes" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const note = await Note.create({
      title,
      content,
      userId: user.id,
    });

    return NextResponse.json({
      message: "Note created",
      note,
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

    const user = await verifyToken(req);

    if (user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5"));
    const skip = (page - 1) * limit;

    const total = await Note.countDocuments({ userId: user.id });
    const notes = await Note.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      count: notes.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      notes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}