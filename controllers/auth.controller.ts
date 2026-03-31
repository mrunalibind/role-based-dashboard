import User from "@/models/user.model";
import { comparePassword } from "@/utils/hash";
import { generateToken } from "@/utils/generateToken";

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    token,
    role: user.role,
    userId: user._id,
  };
};