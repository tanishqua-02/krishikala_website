import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:    { type: String, enum: ["product_approved","product_rejected","product_hidden","product_feedback","seller_approved","seller_rejected","order_update","order_received","seller_request"], required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    meta:    { type: mongoose.Schema.Types.Mixed }, // productId, orderId, etc.
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
