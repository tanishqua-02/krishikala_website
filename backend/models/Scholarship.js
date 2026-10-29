import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true },
    amount: { type: String, required: true },
    deadline: { type: String, required: true },
    deadlineDate: { type: Date },
    eligibility: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    requiredDocuments: [{ type: String }],
    applicationLink: { type: String },
    officialLink: { type: String },
    benefits: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Scholarship", scholarshipSchema);
