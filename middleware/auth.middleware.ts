import jwt from "jsonwebtoken";

export const verifyToken = (req: Request) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    return decoded as { id: string; role: string };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const authorizeRoles = (allowedRoles: string[], userRole: string) => {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden: Access denied");
  }
};