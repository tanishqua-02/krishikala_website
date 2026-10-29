import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null for admin-seeded products
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image:    { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    items:       [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      address:  { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "cod", "card", "razorpay", "stripe"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, default: 50 },
    total:        { type: Number, required: true },
    deliveredAt:  { type: Date },
    notes:        { type: String },

    // ── Razorpay fields (legacy — kept for existing orders) ──────────────────
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // ── Stripe fields ─────────────────────────────────────────────────────────
    stripePaymentIntentId: { type: String, default: null },
    stripeClientSecret:    { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = "KS-" + Math.floor(10000 + Math.random() * 90000);
  }
  next();
});

export default mongoose.model("Order", orderSchema);
