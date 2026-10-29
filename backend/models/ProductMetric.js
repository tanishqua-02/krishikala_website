import mongoose from "mongoose";

/**
 * Tracks every product interaction for the ML-style recommendation engines.
 * interactionType drives both the trending algorithm and basket analysis.
 */
const productMetricSchema = new mongoose.Schema(
  {
    productId:       { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    interactionType: { type: String, enum: ["click", "search", "addToCart", "purchase"], required: true },
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId:       { type: String, default: null }, // anonymous visitor tracking
  },
  {
    timestamps: true,  // createdAt is used by the trending 7-day window
  }
);

// Compound index for fast 7-day trending aggregation
productMetricSchema.index({ interactionType: 1, createdAt: -1 });
productMetricSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model("ProductMetric", productMetricSchema);
