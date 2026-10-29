import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * crypto.randomInt is uniformly distributed and avoids modulo bias.
 */
const generateOtp = () =>
  String(crypto.randomInt(100000, 999999));

// ─────────────────────────────────────────────────────────────────────────────
// Existing Password Auth
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
export const register = async (req, res) => {
  const { firstName, lastName, email, password, phone, farmerId, landSize, primaryCrop, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }
  // Only allow "user" or "farmer" on self-registration; admin is seeded only
  const safeRole = role === "farmer" ? "farmer" : "user";
  const sellerStatus = safeRole === "farmer" ? "pending" : "none";
  const user = await User.create({
    firstName, lastName, email, password, phone, farmerId, landSize, primaryCrop,
    role: safeRole, sellerStatus,
    sellerAppliedAt: safeRole === "farmer" ? new Date() : undefined,
  });

  // Notify admins when a new farmer registers (pending seller verification)
  if (safeRole === "farmer") {
    try {
      const { createNotification } = await import("./notificationController.js");
      const admins = await User.find({ role: "admin" }, "_id");
      for (const admin of admins) {
        await createNotification(admin._id, "seller_request",
          "New Farmer Registration 🌾",
          `${firstName} ${lastName} registered as a farmer and is pending seller verification.`,
          { userId: user._id }
        );
      }
    } catch {}
  }

  sendTokenResponse(user, 201, res);
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password." });
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }
  sendTokenResponse(user, 200, res);
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  const allowedFields = ["firstName","lastName","phone","address","village","district","state","pincode","landSize","primaryCrop"];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, user });
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect." });
  }
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
};

// ─────────────────────────────────────────────────────────────────────────────
// OTP Passwordless Auth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { identifier: "user@example.com" | "+919876543210" }
 *
 * Flow:
 *  1. Find or create user by email/phone.
 *  2. Generate a cryptographic 6-digit OTP.
 *  3. Hash it with bcrypt before storing (protects against DB compromise).
 *  4. Set 5-minute TTL on otpExpires.
 *  5. Dispatch via SMS gateway or SMTP — see integration notes below.
 */
export const sendOtp = async (req, res) => {
  const { identifier, role } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: "Email or phone number is required." });
  }

  const isEmail   = /\S+@\S+\.\S+/.test(identifier);
  const isPhone   = /^[+\d]{10,15}$/.test(identifier.replace(/\s/g, ""));
  const queryKey  = isEmail ? "email" : "phone";

  if (!isEmail && !isPhone) {
    return res.status(400).json({ success: false, message: "Provide a valid email or phone number." });
  }

  let user = await User.findOne({ [queryKey]: identifier.toLowerCase().trim() });

  if (user && role) {
    // Check if roles match
    if (user.role !== role) {
      const roleText = user.role === "farmer" ? "Farmer / Seller" : "Buyer";
      return res.status(400).json({
        success: false,
        message: `This account is registered as a ${roleText}. Please select the correct role.`
      });
    }
  }

  // For OTP-first registration flows: create a placeholder account with requested role if none exists.
  if (!user) {
    const placeholderName = isEmail
      ? identifier.split("@")[0]
      : `Farmer${identifier.slice(-4)}`;
    const targetRole = role === "farmer" ? "farmer" : "user";
    const sellerStatus = targetRole === "farmer" ? "pending" : "none";

    user = await User.create({
      firstName: placeholderName,
      lastName:  "—",
      email:     isEmail ? identifier.toLowerCase().trim() : `${identifier.replace(/\D/g,"")}@krishiseva.app`,
      phone:     isPhone ? identifier.trim() : undefined,
      password:  crypto.randomBytes(16).toString("hex"), // random non-guessable password
      role:      targetRole,
      sellerStatus,
      sellerAppliedAt: targetRole === "farmer" ? new Date() : undefined,
    });
  }

  const plainOtp  = generateOtp();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await User.findByIdAndUpdate(user._id, { otp: hashedOtp, otpExpires: expiresAt });

  // ── Dispatch OTP ──
  let sentVia = "console";
  let devInboxUrl = null;

  // 1. Try sending via SMS (Twilio) if phone is provided and Twilio is configured
  if (isPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your KrishiSeva OTP is: ${plainOtp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: identifier,
      });
      sentVia = "sms";
    } catch (err) {
      console.error("Twilio SMS send failed:", err.message);
    }
  }

  // 2. Try sending via Email (Nodemailer) if configured
  const recipientEmail = isEmail ? identifier.toLowerCase().trim() : user.email;
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (recipientEmail && (hasSmtpConfig || process.env.NODE_ENV !== "production")) {
    try {
      const nodemailer = (await import("nodemailer")).default;
      let transporter;

      if (hasSmtpConfig) {
        // Real SMTP configuration (e.g., Gmail, Brevo, custom)
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        sentVia = "email";
      } else {
        // Auto-generate a real free Ethereal SMTP test account for development fallback!
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        sentVia = "ethereal";
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || '"KrishiSeva" <noreply@krishiseva.in>',
        to: recipientEmail,
        subject: "Your KrishiSeva OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #059669; margin: 0;">🌾 KrishiSeva</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Empowering Indian Agriculture</p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #f3f4f6;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px;">Your Login Verification OTP is:</p>
              <h1 style="margin: 0; color: #111827; font-size: 36px; font-family: monospace; letter-spacing: 4px; font-weight: bold;">${plainOtp}</h1>
              <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">This OTP is valid for 5 minutes. Do not share this code with anyone.</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">If you did not request this code, please ignore this email.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      if (sentVia === "ethereal") {
        devInboxUrl = nodemailer.getTestMessageUrl(info);
        console.log(`\n📧 [Ethereal Mail Sent] Link: ${devInboxUrl}\n`);
      }
    } catch (err) {
      console.error("Nodemailer Email send failed:", err.message);
    }
  }

  // Development console logger
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📱 [DEV OTP] ${identifier} → ${plainOtp}\n`);
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to ${isEmail ? "email" : "phone"} ending in …${identifier.slice(-3)}.`,
    // Never return the OTP in production; only for dev convenience:
    ...(process.env.NODE_ENV !== "production" && { devOtp: plainOtp }),
  });
};

/**
 * POST /api/auth/verify-otp
 * Body: { identifier: string, otp: string }
 *
 * Flow:
 *  1. Look up user by identifier.
 *  2. Check otpExpires hasn't passed.
 *  3. Compare incoming plaintext OTP against bcrypt hash.
 *  4. Flip isVerified = true, wipe otp/otpExpires.
 *  5. Issue signed JWT — identical to password login response.
 */
export const verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ success: false, message: "Identifier and OTP are required." });
  }

  const isEmail  = /\S+@\S+\.\S+/.test(identifier);
  const queryKey = isEmail ? "email" : "phone";

  const user = await User.findOne({ [queryKey]: identifier.toLowerCase().trim() });

  if (!user || !user.otp || !user.otpExpires) {
    return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
  }

  if (new Date() > user.otpExpires) {
    await User.findByIdAndUpdate(user._id, { otp: null, otpExpires: null });
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
  }

  const isMatch = await bcrypt.compare(String(otp).trim(), user.otp);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid OTP. Please try again." });
  }

  // Verification successful — clean up temp tokens
  await User.findByIdAndUpdate(user._id, { otp: null, otpExpires: null, isVerified: true });

  const freshUser = await User.findById(user._id);
  sendTokenResponse(freshUser, 200, res);
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Farmer Management
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/auth/farmers  (admin)
export const getAllFarmers = async (req, res) => {
  const { verified, search, page = 1, limit = 20 } = req.query;
  const query = { role: "farmer" };
  if (verified === "true")  query.isVerified = true;
  if (verified === "false") query.isVerified = false;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
      { farmerId:  { $regex: search, $options: "i" } },
    ];
  }
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const farmers = await User.find(query)
    .select("-password -otp -otpExpires")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json({ success: true, total, farmers });
};

// GET /api/auth/users  (admin) — all non-admin users
export const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = { role: { $ne: "admin" } };
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ];
  }
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password -otp -otpExpires")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json({ success: true, total, users });
};

// GET /api/auth/users/:id  (admin)
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -otp -otpExpires");
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, user });
};

// DELETE /api/auth/users/:id  (admin)
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, message: "User deleted." });
};

// PUT /api/auth/farmers/:id/verify  (admin)
export const verifyFarmer = async (req, res) => {
  const { isVerified, sellerStatus, sellerNote } = req.body;
  const update = {};
  if (isVerified !== undefined) update.isVerified = !!isVerified;
  
  if (sellerStatus) {
    update.sellerStatus = sellerStatus;
    // If approving as seller, also mark verified
    if (sellerStatus === "approved") update.isVerified = true;
  }
  if (sellerNote) update.sellerNote = sellerNote;
  
  const farmer = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    .select("-password -otp -otpExpires");
    
  if (!farmer) return res.status(404).json({ success: false, message: "Farmer not found." });

  // If farmer's seller status is revoked/rejected, hide their products
  if (sellerStatus === "rejected" || sellerStatus === "none") {
    const Product = (await import("../models/Product.js")).default;
    await Product.updateMany(
      { seller: farmer._id },
      { $set: { isHidden: true, hiddenReason: sellerNote || "Seller verification revoked." } }
    );
  }

  // Notify farmer
  try {
    const { createNotification } = await import("./notificationController.js");
    if (sellerStatus === "approved") {
      await createNotification(farmer._id, "seller_approved",
        "Seller Account Approved ✅",
        "Congratulations! Your seller account has been approved. You can now list products on KrishiSeva.");
    } else if (sellerStatus === "rejected") {
      await createNotification(farmer._id, "seller_rejected",
        "Seller Application Rejected",
        `Your seller application was not approved.${sellerNote ? ` Reason: ${sellerNote}` : " Please contact support."}`);
    }
  } catch {}

  res.status(200).json({ success: true, farmer });
};
