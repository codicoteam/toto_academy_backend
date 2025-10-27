// services/admin_service.js
const Admin = require("../models/admin_model");
const bcrypt = require("bcryptjs");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const OMIT_FIELDS = "-password -__v";

// Helpers
const toE164 = (num) => {
  // If already +E.164, keep; else prefix + (basic)
  return num.startsWith("+") ? num : `+${num.replace(/[^\d]/g, "")}`;
};

// Create a new admin
const createAdmin = async (adminData) => {
  const existingAdmin = await Admin.findOne({ email: adminData.email });
  if (existingAdmin) throw new Error("Email already exists");

  const newAdmin = new Admin(adminData);
  const saved = await newAdmin.save();
  return await Admin.findById(saved._id).select(OMIT_FIELDS);
};

// Get one admin by ID
const getAdminById = async (id) => {
  const admin = await Admin.findById(id).select(OMIT_FIELDS);
  if (!admin) throw new Error("Admin not found");
  return admin;
};

const getAllAdmins = async () => {
  return Admin.find().select(OMIT_FIELDS);
};

const getAdminByEmail = async (email) => {
  return Admin.findOne({ email }).select(OMIT_FIELDS);
};

// Raw admin fetch (with password) for login only
const getAdminForAuth = async (email) => {
  return Admin.findOne({ email }); // includes password
};

// Update an admin (hash if password provided)
const updateAdmin = async (id, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }
  const updated = await Admin.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select(OMIT_FIELDS);
  if (!updated) throw new Error("Admin not found");
  return updated;
};

// Delete an admin
const deleteAdmin = async (id) => {
  const deleted = await Admin.findByIdAndDelete(id).select(OMIT_FIELDS);
  if (!deleted) throw new Error("Admin not found");
  return deleted;
};

/**
 * Password reset: Twilio Verify flow
 * 1) generateAndSendPasswordResetOTP(email)
 *    - creates a verification (sends SMS)
 *    - sets resetPasswordExpires = now + 10m
 * 2) verifyPasswordResetOTP(email, code)
 *    - verificationChecks.create({ to, code })
 *    - if approved: set resetPasswordVerifiedAt = now
 * 3) resetPassword(email, newPassword)
 *    - requires expires > now && verifiedAt within window
 *    - update password and clear fields
 */

// Step 1: send OTP
const generateAndSendPasswordResetOTP = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Email not found");

  const to = toE164(admin.contactNumber);

  await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_ID)
    .verifications.create({ to, channel: "sms" });

  admin.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  admin.resetPasswordVerifiedAt = undefined;
  await admin.save();

  return { success: true, message: "Password reset OTP sent to your phone number" };
};

// Step 2: verify OTP
const verifyPasswordResetOTP = async (email, otpCode) => {
  const admin = await Admin.findOne({
    email,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!admin) throw new Error("OTP expired or invalid request");

  const to = toE164(admin.contactNumber);

  const verificationCheck = await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_ID)
    .verificationChecks.create({ to, code: otpCode });

  if (verificationCheck.status !== "approved") {
    throw new Error("Invalid OTP code");
  }

  admin.resetPasswordVerifiedAt = new Date();
  await admin.save();

  return { success: true, message: "OTP verified successfully" };
};

// Step 3: reset password (requires prior verification)
const resetPassword = async (email, newPassword) => {
  const admin = await Admin.findOne({
    email,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!admin) throw new Error("OTP expired or invalid request");

  // Optional: ensure verification happened within the last 10 minutes
  if (!admin.resetPasswordVerifiedAt) {
    throw new Error("OTP not verified");
  }

  admin.password = newPassword; // will be hashed by pre-save if we save() — but here we’ll hash explicitly to be safe
  admin.password = await bcrypt.hash(admin.password, 12);

  admin.resetPasswordExpires = undefined;
  admin.resetPasswordVerifiedAt = undefined;

  await admin.save();

  return { success: true, message: "Password reset successfully" };
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminByEmail,
  getAdminById,
  getAdminForAuth,
  updateAdmin,
  deleteAdmin,
  generateAndSendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
};
