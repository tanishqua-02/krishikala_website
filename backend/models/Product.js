import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Seeds", "Fertilizers", "Tools", "Irrigation", "Pesticides", "Others"],
    },
    image:       { type: String },
    tag:         { type: String },
    stock:       { type: Number, default: 0, min: 0 },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    unit:        { type: String, default: "unit" },

    // ── Seller fields ─────────────────────────────────────────────────────────
    seller:         { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvalStatus: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    // "approved" by default so admin-created products are live immediately;
    // seller-uploaded products start as "pending" (set in controller)
    isHidden:       { type: Boolean, default: false },
    hiddenReason:   { type: String },
    reEnableRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
