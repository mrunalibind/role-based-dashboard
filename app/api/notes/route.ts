import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Note from "@/models/note.model";
import { verifyToken } from "@/middleware/auth.middleware";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = verifyToken(req);

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

    const user = verifyToken(req);

    if (user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const notes = await Note.find({ userId: user.id });

    return NextResponse.json({
      count: notes.length,
      notes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}