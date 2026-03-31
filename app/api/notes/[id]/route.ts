import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Note from "@/models/note.model";
import { verifyToken } from "@/middleware/auth.middleware";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const user = verifyToken(req);

    if (user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const note = await Note.findById(id);

    if (!note || note.userId.toString() !== user.id) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, content } = body;

    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    return NextResponse.json({
      message: "Note updated",
      note,
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

    const user = verifyToken(req);

    if (user.role !== "user") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const note = await Note.findById(id);

    if (!note || note.userId.toString() !== user.id) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    await note.deleteOne();

    return NextResponse.json({
      message: "Note deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}