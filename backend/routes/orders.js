import express from "express";
import {
  createOrder,
  createPaymentIntent,
  confirmStripePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getSellerOrders,
  updateSellerOrderStatus,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  getFarmerStats,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/",                        createOrder);
// ── Stripe ────────────────────────────────────────────────────────────────────
router.post("/create-payment-intent",   createPaymentIntent);
router.post("/confirm-payment",         confirmStripePayment);
// ── Razorpay (legacy) ─────────────────────────────────────────────────────────
router.post("/create-razorpay-order",   createRazorpayOrder);
router.post("/verify-razorpay",         verifyRazorpayPayment);
// ── Buyer ─────────────────────────────────────────────────────────────────────
router.get("/my-orders",                getMyOrders);
// ── Seller ────────────────────────────────────────────────────────────────────
router.get("/seller-orders",            getSellerOrders);
router.put("/:id/seller-status",        updateSellerOrderStatus);
// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/farmer-stats",             getFarmerStats);
router.get("/stats",    adminOnly,      getOrderStats);
router.get("/admin",    adminOnly,      getAllOrders);
router.get("/:id",                      getOrder);
router.put("/:id/status", adminOnly,    updateOrderStatus);

export default router;
