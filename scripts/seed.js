import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env" });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  createdBy: mongoose.Schema.Types.ObjectId,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const seedSuperAdmin = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: "admin@test.com" });

    if (existing) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@test.com",
      phone: "9999999999",
      password: hashed,
      role: "super-admin",
    });

    console.log("Super Admin created ✅");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();