import mongoose from "mongoose";

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: "Scholarship", required: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    notes:       { type: String },
  },
  { timestamps: true }
);

// One application per user per scholarship
scholarshipApplicationSchema.index({ scholarship: 1, user: 1 }, { unique: true });

export default mongoose.model("ScholarshipApplication", scholarshipApplicationSchema);
