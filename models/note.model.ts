import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note ||
  mongoose.model<INote>("Note", noteSchema);