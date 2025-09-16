const Admin = require("../models/admin_model");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Service to create a new admin
const createAdmin = async (adminData) => {
  try {
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new Error("Email already exists");
    }
    const newAdmin = new Admin(adminData);
    await newAdmin.save();
    return newAdmin;
  } catch (error) {
    throw new Error(error.message);
  }
};


// Service to get one admin by ID
const getAdminById = async (id) => {
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin;
  } catch (error) {
    throw new Error(error.message);
  }
};




const getAllAdmins = async () => {
  try {
    return await Admin.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAdminByEmail = async (email) => {
  try {
    return await Admin.findOne({ email });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to update an admin
const updateAdmin = async (id, updateData) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedAdmin) {
      throw new Error("Admin not found");
    }
    return updatedAdmin;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to delete an admin
const deleteAdmin = async (id) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      throw new Error("Admin not found");
    }
    return deletedAdmin;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Generate and send password reset OTP via SMS using Twilio
const generateAndSendPasswordResetOTP = async (email) => {
  try {
    // Check if email exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Email not found");
    }

    // Format the phone number for Twilio
    const formattedNumber = admin.contactNumber.startsWith("+")
      ? admin.contactNumber
      : `+${admin.contactNumber}`;

    // Send OTP via Twilio Verify
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({ to: formattedNumber, channel: "sms" });

    // Store the verification SID instead of generating our own OTP
    await Admin.findByIdAndUpdate(admin._id, {
      resetPasswordVerificationSid: verification.sid,
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    return {
      success: true,
      message: "Password reset OTP sent to your phone number",
    };
  } catch (error) {
    throw new Error(`Failed to send password reset OTP: ${error.message}`);
  }
};

// Verify password reset OTP
const verifyPasswordResetOTP = async (email, otpCode) => {
  try {
    const admin = await Admin.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      throw new Error("OTP expired or invalid request");
    }

    // Format the phone number for Twilio
    const formattedNumber = admin.contactNumber.startsWith("+")
      ? admin.contactNumber
      : `+${admin.contactNumber}`;

    // Verify the OTP with Twilio using the stored verification SID
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: formattedNumber,
        code: otpCode,
        verificationSid: admin.resetPasswordVerificationSid,
      });

    if (verificationCheck.status === "approved") {
      return {
        success: true,
        message: "OTP verified successfully",
      };
    } else {
      throw new Error("Invalid OTP code");
    }
  } catch (error) {
    throw new Error(`OTP verification failed: ${error.message}`);
  }
};

// Reset password after OTP verification
// Reset password after OTP verification (OTP verification already done in previous step)
const resetPassword = async (email, newPassword) => {
  try {
    const admin = await Admin.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      throw new Error("OTP expired or invalid request");
    }

    // Update password and clear reset fields
    await Admin.findByIdAndUpdate(admin._id, {
      password: newPassword,
      resetPasswordVerificationSid: undefined,
      resetPasswordExpires: undefined,
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
  generateAndSendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,  
  getAdminById
};
