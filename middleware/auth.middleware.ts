import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import BlacklistedToken from "@/models/blacklistedToken.model";

export const verifyToken = async (req: Request) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    await connectDB();

    const blacklisted = await BlacklistedToken.findOne({ token });
    console.log("Blacklisted token check:", blacklisted);
    if (blacklisted) {
      throw new Error("Token revoked");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    return decoded as { id: string; role: string };
  } catch (error: any) {
    throw new Error(error.message || "Invalid or expired token");
  }
};

export const authorizeRoles = (allowedRoles: string[], userRole: string) => {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden: Access denied");
  }
};