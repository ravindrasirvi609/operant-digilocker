import { Schema, model, models, Document } from "mongoose";

export interface ICertificate extends Document {
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: Date;
  certificateType: string;
}

const CertificateSchema = new Schema<ICertificate>({
  name: { type: String, required: true },
  collegeName: { type: String, required: true },
  conferenceName: { type: String, required: true },
  registrationId: { type: String, required: true, unique: true },
  conferenceDate: { type: Date, required: true },
  certificateType: { type: String, required: true },
});

const Certificate =
  models.Certificate || model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
