import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductMetric from "../models/ProductMetric.js";
import { createNotification } from "./notificationController.js";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — log an interaction event (fire-and-forget)
// ─────────────────────────────────────────────────────────────────────────────
const logInteraction = (productId, type, req) => {
  ProductMetric.create({
    productId,
    interactionType: type,
    userId:    req.user?._id || null,
    sessionId: req.headers["x-session-id"] || null,
  }).catch(() => {}); // never block the main response
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  const { category, search, sort = "-createdAt", page = 1, limit = 12 } = req.query;

  if (search) {
    const matchingProducts = await Product.find(
      { isActive: true, approvalStatus: "approved", name: { $regex: search, $options: "i" } },
      "_id"
    ).limit(10);
    matchingProducts.forEach((p) => logInteraction(p._id, "search", req));
  }

  const query = { isActive: true, approvalStatus: "approved", isHidden: false };
  if (category && category !== "All") query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("seller", "firstName lastName")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), products });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/categories
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.status(200).json({ success: true, categories: ["All", ...categories.sort()] });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/trending  ← must be defined BEFORE /:id
// Aggregates the last 7 days of click + search interactions, returns top 8
// ─────────────────────────────────────────────────────────────────────────────
export const getTrending = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await ProductMetric.aggregate([
    {
      $match: {
        interactionType: { $in: ["click", "search", "addToCart"] },
        createdAt:       { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id:   "$productId",
        score: { $sum: 1 }, // each interaction adds 1 to the score
      },
    },
    { $sort: { score: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from:         "products",
        localField:   "_id",
        foreignField: "_id",
        as:           "product",
      },
    },
    { $unwind: "$product" },
    { $match: { "product.isActive": true, "product.isHidden": { $ne: true } } },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$product", { trendingScore: "$score" }],
        },
      },
    },
  ]);

  // If no metrics yet, fall back to top-rated products so the section is never empty
  if (trending.length === 0) {
    const fallback = await Product.find({ isActive: true }).sort("-rating").limit(8);
    return res.status(200).json({ success: true, products: fallback, isFallback: true });
  }

  res.status(200).json({ success: true, products: trending });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/:id/frequently-bought
// Market Basket Analysis — finds top co-purchased products in completed orders
// ─────────────────────────────────────────────────────────────────────────────
export const getFrequentlyBought = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }

  // Import Order inside function to avoid circular references at module load time
  const { default: Order } = await import("../models/Order.js");

  const recommendations = await Order.aggregate([
    // 1. Only analyse orders that contain the target product and were delivered/paid
    {
      $match: {
        "items.product":  new mongoose.Types.ObjectId(id),
        paymentStatus:    "paid",
      },
    },
    // 2. Flatten all items from those orders
    { $unwind: "$items" },
    // 3. Exclude the target product itself from candidates
    {
      $match: {
        "items.product": { $ne: new mongoose.Types.ObjectId(id) },
      },
    },
    // 4. Count how often each co-product appears
    {
      $group: {
        _id:   "$items.product",
        count: { $sum: 1 },
        name:  { $first: "$items.name" },
        price: { $first: "$items.price" },
        image: { $first: "$items.image" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 3 },
    // 5. Enrich with live product data (price may have changed)
    {
      $lookup: {
        from:         "products",
        localField:   "_id",
        foreignField: "_id",
        as:           "liveProduct",
      },
    },
    {
      $project: {
        _id:        "$_id",
        count:      1,
        name:       { $ifNull: [{ $first: "$liveProduct.name" },  "$name"] },
        price:      { $ifNull: [{ $first: "$liveProduct.price" }, "$price"] },
        image:      { $ifNull: [{ $first: "$liveProduct.image" }, "$image"] },
        tag:        { $first: "$liveProduct.tag" },
        rating:     { $first: "$liveProduct.rating" },
        isActive:   { $first: "$liveProduct.isActive" },
      },
    },
    { $match: { isActive: true, isHidden: { $ne: true } } },
  ]);

  res.status(200).json({ success: true, recommendations });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/:id  — logs click metric
// ─────────────────────────────────────────────────────────────────────────────
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  logInteraction(product._id, "click", req);
  res.status(200).json({ success: true, product });
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin CRUD + Seller upload
// ─────────────────────────────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  // Admin creates → auto-approved; seller uploads → pending
  const isSeller = req.user.role === "farmer" && req.user.sellerStatus === "approved";
  const isAdmin  = req.user.role === "admin";
  if (!isAdmin && !isSeller) {
    return res.status(403).json({ success: false, message: "Only approved sellers or admins can add products." });
  }
  const product = await Product.create({
    ...req.body,
    seller:         isAdmin ? null : req.user._id,
    approvalStatus: isAdmin ? "approved" : "pending",
  });

  // Notify admins when a seller submits a new product for review
  if (isSeller) {
    const User = (await import("../models/User.js")).default;
    const admins = await User.find({ role: "admin" }, "_id");
    for (const admin of admins) {
      await createNotification(admin._id, "seller_request",
        "New Product Submitted 📦",
        `Seller ${req.user.firstName} ${req.user.lastName} submitted "${product.name}" for approval.`,
        { productId: product._id, sellerId: req.user._id }
      );
    }
  }

  res.status(201).json({ success: true, product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  res.status(200).json({ success: true, product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  res.status(200).json({ success: true, message: "Product deactivated." });
};

// GET /api/products/admin/all  (admin) — ALL products with seller info
export const getAllProductsAdmin = async (req, res) => {
  const { search, category, status, page = 1, limit = 30 } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category && category !== "All") query.category = category;
  if (status === "pending")  query.approvalStatus = "pending";
  if (status === "approved") query.approvalStatus = "approved";
  if (status === "rejected") query.approvalStatus = "rejected";
  if (status === "hidden")   query.isHidden = true;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("seller", "firstName lastName email farmerId")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json({ success: true, total, products });
};

// PUT /api/products/:id/admin-edit  (admin) — edit any product + notify seller
export const adminEditProduct = async (req, res) => {
  const allowed = ["name","description","price","stock","unit","image","tag","category","approvalStatus","isHidden","hiddenReason"];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate("seller", "_id firstName lastName");
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  // Notify seller about admin edit
  if (product.seller?._id) {
    const changedFields = Object.keys(updates).filter(k => !["isHidden","hiddenReason"].includes(k));
    const msg = changedFields.length > 0
      ? `Admin updated your product "${product.name}". Fields changed: ${changedFields.join(", ")}.`
      : `Admin made changes to your product "${product.name}".`;
    await createNotification(product.seller._id, "product_feedback",
      "Product Updated by Admin",
      msg,
      { productId: product._id });
  }
  res.status(200).json({ success: true, product });
};

// GET /api/products/admin/pending  (admin) — products awaiting approval
export const getPendingProducts = async (req, res) => {
  const products = await Product.find({ approvalStatus: "pending" })
    .populate("seller", "firstName lastName email farmerId")
    .sort("-createdAt");
  res.status(200).json({ success: true, products });
};

// PUT /api/products/:id/approve  (admin)
export const approveProduct = async (req, res) => {
  const { approvalStatus, feedback } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { approvalStatus, isActive: approvalStatus === "approved", ...(feedback ? { hiddenReason: feedback } : {}) },
    { new: true }
  ).populate("seller", "firstName lastName email _id");
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  // Notify seller
  if (product.seller?._id) {
    if (approvalStatus === "approved") {
      await createNotification(product.seller._id, "product_approved",
        "Product Approved ✅",
        `Your product "${product.name}" has been approved and is now live on the shop.`,
        { productId: product._id });
    } else {
      await createNotification(product.seller._id, "product_rejected",
        "Product Rejected",
        `Your product "${product.name}" was rejected.${feedback ? ` Reason: ${feedback}` : " Please review and resubmit."}`,
        { productId: product._id, feedback });
    }
  }
  res.status(200).json({ success: true, product });
};

// PUT /api/products/:id/hide (admin)
export const hideProduct = async (req, res) => {
  const { isHidden, hiddenReason } = req.body;
  const update = { isHidden: !!isHidden };
  if (isHidden && hiddenReason) update.hiddenReason = hiddenReason;
  if (!isHidden) { update.hiddenReason = ""; update.reEnableRequested = false; }

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate("seller", "_id firstName lastName");
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  // Notify seller
  if (product.seller?._id) {
    if (isHidden) {
      await createNotification(product.seller._id, "product_hidden",
        "Product Hidden",
        `Your product "${product.name}" has been hidden from the shop.${hiddenReason ? ` Feedback: ${hiddenReason}` : ""}`,
        { productId: product._id, feedback: hiddenReason });
    } else {
      await createNotification(product.seller._id, "product_feedback",
        "Product Restored ✅",
        `Your product "${product.name}" is now visible again on the shop.`,
        { productId: product._id });
    }
  }
  res.status(200).json({ success: true, product });
};

// PUT /api/products/:id/request-reenable (seller)
export const requestReEnableProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id, isHidden: true },
    { reEnableRequested: true },
    { new: true }
  ).populate("seller", "firstName lastName");
  if (!product) return res.status(404).json({ success: false, message: "Product not found or not hidden." });

  // Notify all admins about the re-enable request
  const User = (await import("../models/User.js")).default;
  const admins = await User.find({ role: "admin" }, "_id");
  for (const admin of admins) {
    await createNotification(admin._id, "seller_request",
      "Re-enable Request 🔔",
      `Seller ${product.seller?.firstName} ${product.seller?.lastName} requested re-enable for product "${product.name}".`,
      { productId: product._id, sellerId: req.user._id }
    );
  }

  res.status(200).json({ success: true, message: "Re-enable request sent.", product });
};

// GET /api/products/my-products  (seller)
export const getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, products });
};

// PUT /api/products/:id/seller-update  (seller — own products only)
export const sellerUpdateProduct = async (req, res) => {
  const allowed = ["name","description","price","stock","unit","image","tag","category"];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  // Re-submit for approval if price/description changed
  updates.approvalStatus = "pending";
  updates.isActive = false;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ success: false, message: "Product not found or not yours." });
  res.status(200).json({ success: true, product, message: "Product updated and re-submitted for review." });
};

// DELETE /api/products/:id/seller-delete  (seller — own products only)
export const sellerDeleteProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!product) return res.status(404).json({ success: false, message: "Product not found or not yours." });
  res.status(200).json({ success: true, message: "Product removed from your listings." });
};
