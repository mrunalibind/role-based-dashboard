import { NextResponse } from "next/server";
import { verifyToken, authorizeRoles } from "@/middleware/auth.middleware";

export async function GET(req: Request) {
  try {
    const user = verifyToken(req);

    authorizeRoles(["super-admin"], user.role);

    return NextResponse.json({
      message: "Access granted",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }
}