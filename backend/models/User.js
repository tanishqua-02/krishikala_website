import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, minlength: 6 },
    phone:        { type: String, trim: true },
    farmerId:     { type: String, trim: true },
    landSize:     { type: Number },
    primaryCrop:  { type: String },
    address:      { type: String },
    village:      { type: String },
    district:     { type: String },
    state:        { type: String },
    pincode:      { type: String },

    // "user" = buyer only, "farmer" = buyer + can apply to sell, "admin" = platform admin
    role:            { type: String, enum: ["user", "farmer", "admin"], default: "user" },
    isVerified:      { type: Boolean, default: false },
    sellerStatus:    { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    sellerAppliedAt: { type: Date },
    sellerNote:      { type: String },
    profileImage:    { type: String },

    // OTP passwordless auth
    otp:        { type: String, default: null },
    otpExpires: { type: Date,   default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
