import express from "express";
import {
  register, login, getMe, updateProfile, changePassword,
  sendOtp, verifyOtp,
  getAllFarmers, getAllUsers, getUserById, deleteUser, verifyFarmer,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register",          register);
router.post("/login",             login);
router.post("/send-otp",          sendOtp);
router.post("/verify-otp",        verifyOtp);
router.get("/me",                 protect, getMe);
router.put("/update-profile",     protect, updateProfile);
router.put("/change-password",    protect, changePassword);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/farmers",            protect, adminOnly, getAllFarmers);
router.get("/users",              protect, adminOnly, getAllUsers);
router.get("/users/:id",          protect, adminOnly, getUserById);
router.delete("/users/:id",       protect, adminOnly, deleteUser);
router.put("/farmers/:id/verify", protect, adminOnly, verifyFarmer);

export default router;
