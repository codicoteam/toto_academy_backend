// models/admin_model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: null }, // was required:true (too strict)
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    contactNumber: { type: String, required: true, trim: true }, // store E.164 if possible
    password: { type: String, required: true },

    // OTP/reset flow (Twilio Verify – no need to store the code)
    resetPasswordExpires: { type: Date },
    resetPasswordVerifiedAt: { type: Date }, // set after successful OTP verify

    role: {
      type: String,
      enum: ["teacher", "main admin"],
      default: "teacher",
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password on create & when modified
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Convenience method for login
adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Ensure unique index on email
adminSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Admin", adminSchema);
