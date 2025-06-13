import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  certificateNumber: string;
  email: string;
  date: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    date: { type: Date, required: true },
    certificateUrl: { type: String },
  },
  { timestamps: true }
);

// Create index for faster certificate number searches
UserSchema.index({ certificateNumber: 1 });

// Use mongoose.models to check if the model is already defined
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
