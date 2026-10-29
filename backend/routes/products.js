import express from "express";
import {
  getProducts, getCategories, getTrending, getFrequentlyBought, getProduct,
  createProduct, updateProduct, deleteProduct,
  getPendingProducts, getAllProductsAdmin, approveProduct, hideProduct, adminEditProduct,
  getMyProducts, sellerUpdateProduct, sellerDeleteProduct, requestReEnableProduct,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",                       getProducts);
router.get("/categories",             getCategories);
router.get("/trending",               getTrending);
router.get("/:id/frequently-bought",  getFrequentlyBought);
router.get("/:id",                    getProduct);

// ── Seller ────────────────────────────────────────────────────────────────────
router.get("/seller/my-products",         protect, getMyProducts);
router.post("/",                          protect, createProduct);
router.put("/:id/seller-update",          protect, sellerUpdateProduct);
router.delete("/:id/seller-delete",       protect, sellerDeleteProduct);
router.put("/:id/request-reenable",       protect, requestReEnableProduct);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/pending",              protect, adminOnly, getPendingProducts);
router.get("/admin/all",                  protect, adminOnly, getAllProductsAdmin);
router.put("/:id/approve",               protect, adminOnly, approveProduct);
router.put("/:id/hide",                  protect, adminOnly, hideProduct);
router.put("/:id/admin-edit",            protect, adminOnly, adminEditProduct);
router.put("/:id",                       protect, adminOnly, updateProduct);
router.delete("/:id",                    protect, adminOnly, deleteProduct);

export default router;
