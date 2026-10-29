import mongoose from "mongoose";

const landRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    surveyNumber: { type: String, required: true },
    village: { type: String, required: true },
    taluka: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, default: "Maharashtra" },
    ownerName: { type: String, required: true },
    area: { type: Number },
    areaUnit: { type: String, default: "Hectares" },
    landType: { type: String },
    recordType: { type: String, enum: ["712", "khateutara", "other"], default: "712" },
    recordData: { type: mongoose.Schema.Types.Mixed },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LandRecord", landRecordSchema);
