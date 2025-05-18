import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  conferenceId: string;
  email: string;
  digiLockerId: string;
  date: Date;
  certificateUri?: string;
  certificateS3Url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    conferenceId: { type: String, required: true },
    email: { type: String, required: true },
    digiLockerId: { type: String, required: true },
    date: { type: Date, required: true },
    certificateUri: { type: String },
    certificateS3Url: { type: String },
  },
  { timestamps: true }
);

// Use mongoose.models to check if the model is already defined
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
