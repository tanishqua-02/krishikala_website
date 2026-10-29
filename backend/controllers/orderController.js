import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ProductMetric from "../models/ProductMetric.js";

// ─────────────────────────────────────────────────────────────────────────────
// Stripe helper — lazy-load so missing keys don't crash the server
// ─────────────────────────────────────────────────────────────────────────────
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const isMock = !secretKey || secretKey === "sk_test_REPLACE_ME";
  if (isMock) return null;
  const { default: Stripe } = require("stripe"); // dynamic require for ESM compat
  return new Stripe(secretKey, { apiVersion: "2024-04-10" });
}

async function getStripeAsync() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const isMock = !secretKey || secretKey === "sk_test_REPLACE_ME";
  if (isMock) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(secretKey, { apiVersion: "2024-04-10" });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  — create COD / internal order
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  // Filter out orphaned items (product deleted from DB but still in cart)
  const validCartItems = cart.items.filter((item) => item.product != null);
  if (validCartItems.length === 0) {
    return res.status(400).json({ success: false, message: "All cart items are unavailable. Please refresh your cart." });
  }

  const items = validCartItems.map((item) => ({
    product:  item.product._id,
    seller:   item.product.seller || null,
    name:     item.product.name,
    price:    item.product.price,
    quantity: item.quantity,
    image:    item.product.image,
  }));

  const subtotal    = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 2000 ? 0 : 50;
  const total        = subtotal + shippingCost;

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    total,
    notes,
    paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    orderStatus:   "placed",
  });

  // Log purchase metric for each item
  items.forEach((i) => {
    ProductMetric.create({ productId: i.product, interactionType: "purchase", userId: req.user._id }).catch(() => {});
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Notify each unique seller about the new order
  const { createNotification } = await import("./notificationController.js");
  const sellerIds = [...new Set(items.filter(i => i.seller).map(i => i.seller.toString()))];
  for (const sid of sellerIds) {
    const sellerItems = items.filter(i => i.seller?.toString() === sid);
    const itemNames = sellerItems.map(i => `${i.name} ×${i.quantity}`).join(", ");
    await createNotification(
      sid, "order_update",
      "New Order Received 🛒",
      `Order #${order.orderNumber} placed for: ${itemNames}`,
      { orderId: order._id, orderNumber: order.orderNumber }
    );
  }

  res.status(201).json({ success: true, order });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create-payment-intent
// Creates a Stripe PaymentIntent; amounts verified server-side against DB cart
// ─────────────────────────────────────────────────────────────────────────────
export const createPaymentIntent = async (req, res) => {
  const { shippingAddress, notes } = req.body;

  // 1. Resolve cart from DB — never trust client-sent totals
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  // Filter out orphaned items (product deleted from DB but still in cart)
  const validCartItems = cart.items.filter((i) => i.product != null);
  if (validCartItems.length === 0) {
    return res.status(400).json({ success: false, message: "All cart items are unavailable. Please refresh your cart." });
  }

  const subtotal     = validCartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= 2000 ? 0 : 50;
  const totalPaise   = Math.round((subtotal + shippingCost) * 100);

  // 2. Build order items
  const items = validCartItems.map((i) => ({
    product:  i.product._id,
    seller:   i.product.seller || null,
    name:     i.product.name,
    price:    i.product.price,
    quantity: i.quantity,
    image:    i.product.image,
  }));

  // 3. Create a pending Order document first
  const order = await Order.create({
    user:          req.user._id,
    items,
    shippingAddress,
    paymentMethod: "stripe",
    subtotal,
    shippingCost,
    total:          subtotal + shippingCost,
    notes,
    paymentStatus: "pending",
    orderStatus:   "placed",
  });

  // 4. Try real Stripe, fall back to mock
  const stripe = await getStripeAsync();

  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount:   totalPaise,
        currency: "inr",
        metadata: {
          krishiseva_order_id: order._id.toString(),
          user_id:             req.user._id.toString(),
        },
        description: `KrishiSeva Order ${order.orderNumber}`,
      });

      await Order.findByIdAndUpdate(order._id, {
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret:    paymentIntent.client_secret,
      });

      return res.status(200).json({
        success:      true,
        isMock:       false,
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        orderDbId:    order._id,
        amount:       totalPaise,
        currency:     "inr",
      });
    } catch (error) {
      console.error("Stripe PaymentIntent creation failed, falling back to mock:", error);
    }
  }

  // ── Mock for development (no real Stripe keys configured) ─────────────────
  const mockIntentId = `pi_dev_${crypto.randomBytes(8).toString("hex")}`;
  const mockSecret   = `${mockIntentId}_secret_${crypto.randomBytes(8).toString("hex")}`;

  await Order.findByIdAndUpdate(order._id, {
    stripePaymentIntentId: mockIntentId,
    stripeClientSecret:    mockSecret,
  });

  res.status(200).json({
    success:      true,
    isMock:       true,
    clientSecret: mockSecret,
    publishableKey: "pk_test_mock_key",
    orderDbId:    order._id,
    amount:       totalPaise,
    currency:     "inr",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/confirm-payment
// Called after Stripe.js confirms the payment on the client side
// ─────────────────────────────────────────────────────────────────────────────
export const confirmStripePayment = async (req, res) => {
  const { paymentIntentId, orderDbId } = req.body;

  // Mock / sandbox path
  if (paymentIntentId?.startsWith("pi_dev_")) {
    const order = await Order.findByIdAndUpdate(
      orderDbId,
      {
        paymentStatus:         "paid",
        orderStatus:           "confirmed",
        stripePaymentIntentId: paymentIntentId,
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    order.items.forEach((i) => {
      ProductMetric.create({ productId: i.product, interactionType: "purchase", userId: order.user }).catch(() => {});
    });

    // Notify sellers
    const { createNotification } = await import("./notificationController.js");
    const sellerIds = [...new Set(order.items.filter(i => i.seller).map(i => i.seller.toString()))];
    for (const sid of sellerIds) {
      const sellerItems = order.items.filter(i => i.seller?.toString() === sid);
      const itemNames = sellerItems.map(i => `${i.name} ×${i.quantity}`).join(", ");
      await createNotification(
        sid, "order_update",
        "New Order Received 🛒",
        `Order #${order.orderNumber} placed for: ${itemNames}`,
        { orderId: order._id, orderNumber: order.orderNumber }
      );
    }

    return res.status(200).json({ success: true, order });
  }

  // Real Stripe — verify the PaymentIntent status server-side
  const stripe = await getStripeAsync();
  if (!stripe) {
    return res.status(500).json({ success: false, message: "Payment gateway not configured." });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    await Order.findByIdAndUpdate(orderDbId, { paymentStatus: "failed" });
    return res.status(400).json({
      success: false,
      message: `Payment not completed. Status: ${paymentIntent.status}`,
    });
  }

  const order = await Order.findByIdAndUpdate(
    orderDbId,
    {
      paymentStatus:         "paid",
      orderStatus:           "confirmed",
      stripePaymentIntentId: paymentIntent.id,
    },
    { new: true }
  );

  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
  order.items.forEach((i) => {
    ProductMetric.create({ productId: i.product, interactionType: "purchase", userId: order.user }).catch(() => {});
  });

  // Notify sellers
  const { createNotification } = await import("./notificationController.js");
  const sellerIds2 = [...new Set(order.items.filter(i => i.seller).map(i => i.seller.toString()))];
  for (const sid of sellerIds2) {
    const sellerItems = order.items.filter(i => i.seller?.toString() === sid);
    const itemNames = sellerItems.map(i => `${i.name} ×${i.quantity}`).join(", ");
    await createNotification(
      sid, "order_update",
      "New Order Received 🛒",
      `Order #${order.orderNumber} placed for: ${itemNames}`,
      { orderId: order._id, orderNumber: order.orderNumber }
    );
  }

  res.status(200).json({ success: true, order });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/stripe  (un-guarded — Stripe hits this directly)
// Validates Stripe-Signature header before any DB mutation
// ─────────────────────────────────────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature     = req.headers["stripe-signature"];

  const stripe = await getStripeAsync();

  let event;
  if (stripe && webhookSecret && webhookSecret !== "whsec_REPLACE_ME") {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }
  } else {
    // Dev mode — parse raw body without verification
    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ success: false, message: "Invalid JSON body." });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId       = paymentIntent.metadata?.krishiseva_order_id;

    if (orderId) {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus:         "paid",
          orderStatus:           "confirmed",
          stripePaymentIntentId: paymentIntent.id,
        },
        { new: true }
      );

      if (order) {
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const orderId       = paymentIntent.metadata?.krishiseva_order_id;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    }
  }

  // Always respond 200 to acknowledge receipt — Stripe retries on non-200
  res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create-razorpay-order  (LEGACY — kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
  const { shippingAddress, notes } = req.body;

  // 1. Resolve cart from DB — never trust client-sent totals
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  // Filter out orphaned items
  const validCartItems = cart.items.filter((i) => i.product != null);
  if (validCartItems.length === 0) {
    return res.status(400).json({ success: false, message: "All cart items are unavailable. Please refresh your cart." });
  }

  const subtotal    = validCartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= 2000 ? 0 : 50;
  const totalPaise   = Math.round((subtotal + shippingCost) * 100);

  // 2. Create a pending Order document first so we can attach razorpayOrderId
  const items = validCartItems.map((i) => ({
    product:  i.product._id,
    seller:   i.product.seller || null,
    name:     i.product.name,
    price:    i.product.price,
    quantity: i.quantity,
    image:    i.product.image,
  }));

  const order = await Order.create({
    user:          req.user._id,
    items,
    shippingAddress,
    paymentMethod: "razorpay",
    subtotal,
    shippingCost,
    total:          subtotal + shippingCost,
    notes,
    paymentStatus: "pending",
    orderStatus:   "placed",
  });

  // 3. Call Razorpay Orders API
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  const isDefaultOrPlaceholder = !key_id || key_id === "rzp_test_REPLACE_ME" || !key_secret || key_secret === "your_razorpay_key_secret";

  if (!isDefaultOrPlaceholder) {
    try {
      const { default: Razorpay } = await import("razorpay");
      const razorpay = new Razorpay({
        key_id,
        key_secret,
      });
      const rzpOrder = await razorpay.orders.create({
        amount:   totalPaise,
        currency: "INR",
        receipt:  order._id.toString(),
        notes:    { krishiseva_order_id: order._id.toString() },
      });
      await Order.findByIdAndUpdate(order._id, { razorpayOrderId: rzpOrder.id });

      return res.status(200).json({
        success: true,
        isMock: false,
        key:          key_id,
        razorpayOrderId: rzpOrder.id,
        amount:       totalPaise,
        currency:     "INR",
        orderDbId:    order._id,
        prefill: {
          name:    `${req.user.firstName} ${req.user.lastName}`,
          email:   req.user.email,
          contact: req.user.phone || "",
        },
      });
    } catch (error) {
      console.error("Razorpay order creation failed, falling back to mock:", error);
    }
  }

  // ── Mock receipt for development (fallback if keys are placeholders or API fails)
  const mockRzpOrderId = `order_dev_${crypto.randomBytes(8).toString("hex")}`;
  await Order.findByIdAndUpdate(order._id, { razorpayOrderId: mockRzpOrderId });

  res.status(200).json({
    success: true,
    isMock: true,
    key:          "rzp_test_mock_key",
    razorpayOrderId: mockRzpOrderId,
    amount:       totalPaise,
    currency:     "INR",
    orderDbId:    order._id,
    prefill: {
      name:    `${req.user.firstName} ${req.user.lastName}`,
      email:   req.user.email,
      contact: req.user.phone || "",
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/verify-razorpay
// Client calls this after Razorpay success callback to confirm payment
// ─────────────────────────────────────────────────────────────────────────────
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDbId } = req.body;

  // 1. Skip HMAC signature check for mock/sandbox transactions
  if (razorpay_order_id?.startsWith("order_dev_") || razorpay_signature === "mock_signature_success") {
    const order = await Order.findByIdAndUpdate(
      orderDbId,
      {
        paymentStatus:   "paid",
        orderStatus:     "confirmed",
        razorpayPaymentId: razorpay_payment_id || `pay_mock_${crypto.randomBytes(8).toString("hex")}`,
        razorpayOrderId: razorpay_order_id,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Clear the buyer's cart after confirmed payment
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    // Log purchase metrics
    order.items.forEach((i) => {
      ProductMetric.create({ productId: i.product, interactionType: "purchase", userId: order.user }).catch(() => {});
    });

    return res.status(200).json({ success: true, order });
  }

  // 2. Real Razorpay Verification
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dev_secret")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await Order.findByIdAndUpdate(orderDbId, { paymentStatus: "failed" });
    return res.status(400).json({ success: false, message: "Payment signature verification failed." });
  }

  const order = await Order.findByIdAndUpdate(
    orderDbId,
    {
      paymentStatus:   "paid",
      orderStatus:     "confirmed",
      razorpayPaymentId: razorpay_payment_id,
    },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  // Clear the buyer's cart after confirmed payment
  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

  // Log purchase metrics
  order.items.forEach((i) => {
    ProductMetric.create({ productId: i.product, interactionType: "purchase", userId: order.user }).catch(() => {});
  });

  res.status(200).json({ success: true, order });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/razorpay  (un-guarded — Razorpay hits this directly)
// Validates Razorpay-Signature header before any DB mutation
// ─────────────────────────────────────────────────────────────────────────────
export const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "dev_webhook_secret";
  const signature     = req.headers["x-razorpay-signature"];

  // Razorpay sends the raw request body for HMAC verification
  // Express must use express.raw() for this route — configured in server.js
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body) // Buffer when using express.raw()
    .digest("hex");

  if (signature !== expectedSig) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature." });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const rzpOrderId    = paymentEntity.order_id;
    const paymentId     = paymentEntity.id;

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: rzpOrderId },
      { paymentStatus: "paid", orderStatus: "confirmed", razorpayPaymentId: paymentId },
      { new: true }
    );

    if (order) {
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    }
  }

  // Always respond 200 to acknowledge receipt — Razorpay retries on non-200
  res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/seller-orders  — orders containing this seller's products
// ─────────────────────────────────────────────────────────────────────────────
export const getSellerOrders = async (req, res) => {
  const sellerId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const match = { "items.seller": sellerId };
  if (status) match.orderStatus = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(match);

  const orders = await Order.find(match)
    .populate("user", "firstName lastName email phone")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));

  // For each order, only expose the items that belong to this seller
  const filtered = orders.map(o => {
    const sellerItems = o.items.filter(i => i.seller?.toString() === sellerId.toString());
    const sellerSubtotal = sellerItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return {
      _id:             o._id,
      orderNumber:     o.orderNumber,
      createdAt:       o.createdAt,
      orderStatus:     o.orderStatus,
      paymentStatus:   o.paymentStatus,
      paymentMethod:   o.paymentMethod,
      shippingAddress: o.shippingAddress,
      notes:           o.notes,
      deliveredAt:     o.deliveredAt,
      buyer: o.user,
      sellerItems,
      sellerSubtotal,
      total:           o.total,
    };
  });

  res.status(200).json({ success: true, total, orders: filtered });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/seller-status  — seller updates status of their order
// Allowed transitions: placed→confirmed, confirmed→processing,
//                      processing→shipped, shipped→delivered
// ─────────────────────────────────────────────────────────────────────────────
export const updateSellerOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;
  const sellerId = req.user._id;

  const ALLOWED = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!ALLOWED.includes(orderStatus)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${ALLOWED.join(", ")}` });
  }

  // Verify this order actually contains items from this seller
  const order = await Order.findOne({ _id: req.params.id, "items.seller": sellerId })
    .populate("user", "firstName lastName email");
  if (!order) return res.status(404).json({ success: false, message: "Order not found or not yours." });

  const update = { orderStatus };
  if (orderStatus === "delivered") update.deliveredAt = new Date();

  const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });

  // Notify the buyer about the status change
  const { createNotification } = await import("./notificationController.js");
  const statusLabels = {
    confirmed:  "Order Confirmed",
    processing: "Order Being Processed",
    shipped:    "Order Shipped",
    delivered:  "Order Delivered",
    cancelled:  "Order Cancelled",
  };
  await createNotification(
    order.user._id,
    "order_update",
    statusLabels[orderStatus] || "Order Update",
    `Your order #${order.orderNumber} has been ${orderStatus} by the seller.`,
    { orderId: order._id, orderNumber: order.orderNumber, orderStatus }
  );

  res.status(200).json({ success: true, order: updated });
};

// ─────────────────────────────────────────────────────────────────────────────
// Standard order reads
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, orders });
};

export const getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  res.status(200).json({ success: true, order });
};

export const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.orderStatus = status;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "firstName lastName email phone")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json({ success: true, total, orders });
};

export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const update = {};
  if (orderStatus)  update.orderStatus  = orderStatus;
  if (paymentStatus) update.paymentStatus = paymentStatus;
  if (orderStatus === "delivered") update.deliveredAt = new Date();
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  res.status(200).json({ success: true, order });
};

export const getOrderStats = async (req, res) => {
  const User = (await import("../models/User.js")).default;
  const Product = (await import("../models/Product.js")).default;

  const [totalOrders, revenueAgg, activeOrders, totalFarmers, verifiedFarmers, pendingFarmers, pendingProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments({ orderStatus: { $in: ["placed","confirmed","processing","shipped"] } }),
    User.countDocuments({ role: "farmer" }),
    User.countDocuments({ role: "farmer", isVerified: true }),
    User.countDocuments({ role: "farmer", sellerStatus: "pending" }),
    Product.countDocuments({ approvalStatus: "pending" }),
    User.countDocuments({ role: "user" }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue:    revenueAgg[0]?.total || 0,
      activeOrders,
      totalFarmers,
      verifiedFarmers,
      pendingFarmers,
      pendingProducts,
      totalUsers,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Farmer Specific Stats
// ─────────────────────────────────────────────────────────────────────────────
export const getFarmerStats = async (req, res) => {
  const { period = "monthly" } = req.query; // weekly, monthly, quarterly, yearly
  const farmerId = req.user._id;
  const now = new Date();
  let startDate = new Date();

  if (period === "weekly") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === "quarterly") {
    startDate.setMonth(now.getMonth() - 3);
  } else if (period === "yearly") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    startDate.setMonth(now.getMonth() - 1); // default monthly
  }

  // 1. Total Spent (Orders where the farmer is the BUYER)
  const spentAgg = await Order.aggregate([
    { $match: { user: farmerId, paymentStatus: "paid", createdAt: { $gte: startDate } } },
    { $group: { _id: null, totalSpent: { $sum: "$total" } } }
  ]);

  // 2. Revenue & Orders Received (Orders containing items where farmer is the SELLER)
  const revenueAgg = await Order.aggregate([
    { $match: { "items.seller": farmerId, paymentStatus: "paid", createdAt: { $gte: startDate } } },
    { $unwind: "$items" },
    { $match: { "items.seller": farmerId } },
    { $group: {
      _id: null,
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      itemsSold: { $sum: "$items.quantity" }
    }}
  ]);

  const ordersReceived = await Order.countDocuments({ "items.seller": farmerId, createdAt: { $gte: startDate } });
  const ordersPending = await Order.countDocuments({ "items.seller": farmerId, orderStatus: { $in: ["placed", "confirmed", "processing"] }, createdAt: { $gte: startDate } });
  const completedOrders = await Order.countDocuments({ "items.seller": farmerId, orderStatus: "delivered", createdAt: { $gte: startDate } });

  res.status(200).json({
    success: true,
    stats: {
      totalSpent: spentAgg[0]?.totalSpent || 0,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      itemsSold: revenueAgg[0]?.itemsSold || 0,
      ordersReceived,
      ordersPending,
      completedOrders,
      period
    }
  });
};
