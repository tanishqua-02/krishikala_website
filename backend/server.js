import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import scholarshipRoutes from "./routes/scholarships.js";
import landRecordRoutes from "./routes/landRecords.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import { razorpayWebhook, stripeWebhook } from "./controllers/orderController.js";

dotenv.config();
connectDB();

const app = express();

// ── Razorpay webhook needs the raw body buffer for HMAC verification ─────────
// This route must be registered BEFORE express.json() middleware
app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// ── Stripe webhook needs the raw body buffer for signature verification ───────
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ── Standard middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "KrishiSeva API is running 🌾", version: "2.0" });
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get("/api/dashboard", async (req, res) => {
  const jwt = await import("jsonwebtoken");
  const User = (await import("./models/User.js")).default;
  const Order = (await import("./models/Order.js")).default;
  const LandRecord = (await import("./models/LandRecord.js")).default;
  const ScholarshipApplication = (await import("./models/ScholarshipApplication.js")).default;
  const Scholarship = (await import("./models/Scholarship.js")).default;
  const Product = (await import("./models/Product.js")).default;

  let user = null;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id);
    }
  } catch {}

  if (!user) return res.status(401).json({ success: false, message: "Not authorized." });

  // ── Farmer/Seller dashboard ───────────────────────────────────────────────
  const [activeOrders, landRecords, scholarships, recentOrders, upcomingDeadlines] = await Promise.all([
    Order.countDocuments({ user: user._id, orderStatus: { $in: ["placed","confirmed","processing","shipped"] } }),
    LandRecord.countDocuments({ user: user._id }),
    ScholarshipApplication.countDocuments({ user: user._id }),
    Order.find({ user: user._id }).sort("-createdAt").limit(5),
    Scholarship.find({ isActive: true, deadlineDate: { $gte: new Date() } }).sort("deadlineDate").limit(3),
  ]);

  const totalSpentAgg = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  // ── Seller-specific stats (only for approved farmers) ─────────────────────
  let sellerStats = null;
  if (user.role === "farmer" && user.sellerStatus === "approved") {
    const myProducts = await Product.find({ seller: user._id }, "_id");
    const myProductIds = myProducts.map(p => p._id);

    const [ordersReceived, pendingOrders, completedOrders, revenueAgg, myProductCount, pendingApprovals] = await Promise.all([
      Order.countDocuments({ "items.product": { $in: myProductIds } }),
      Order.countDocuments({ "items.product": { $in: myProductIds }, orderStatus: { $in: ["placed","confirmed","processing"] } }),
      Order.countDocuments({ "items.product": { $in: myProductIds }, orderStatus: "delivered" }),
      Order.aggregate([
        { $match: { "items.product": { $in: myProductIds }, paymentStatus: "paid" } },
        { $unwind: "$items" },
        { $match: { "items.product": { $in: myProductIds } } },
        { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      ]),
      Product.countDocuments({ seller: user._id, isActive: true }),
      Product.countDocuments({ seller: user._id, approvalStatus: "pending" }),
    ]);

    sellerStats = {
      orders_received:   ordersReceived,
      orders_pending:    pendingOrders,
      orders_completed:  completedOrders,
      revenue:           revenueAgg[0]?.total || 0,
      products_listed:   myProductCount,
      pending_approvals: pendingApprovals,
    };
  }

  res.json({
    success: true,
    stats: {
      active_orders: activeOrders,
      land_records:  landRecords,
      scholarships,
      total_spent:   totalSpentAgg[0]?.total || 0,
    },
    seller_stats: sellerStats,
    recent_orders: recentOrders.map(o => ({
      id: o._id, created_at: o.createdAt, total_amount: o.total, status: o.orderStatus,
    })),
    upcoming_deadlines: upcomingDeadlines.map(s => ({
      title: s.title, deadline: s.deadline,
    })),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/products",      productRoutes);
app.use("/api/cart",          cartRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/scholarships",  scholarshipRoutes);
app.use("/api/land-records",  landRecordRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌾 KrishiSeva API v2.0 running on port ${PORT}`);
});
