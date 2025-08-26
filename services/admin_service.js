const Admin = require('../models/admin_model');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Service to create a new admin
const createAdmin = async (adminData) => {
    try {
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            throw new Error('Email already exists');
        }
        const newAdmin = new Admin(adminData);
        await newAdmin.save();
        return newAdmin;
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
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAdmin) {
            throw new Error('Admin not found');
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
            throw new Error('Admin not found');
        }
        return deletedAdmin;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Generate and send password reset OTP via email
const generateAndSendPasswordResetOTP = async (email) => {
    try {
        // Check if email exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Email not found');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set OTP and expiration (10 minutes)
        const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        await Admin.findByIdAndUpdate(admin._id, {
            resetPasswordOTP: otp,
            resetPasswordExpires
        });

        // Send email with OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Admin Password Reset OTP',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your admin account password. Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return { 
            success: true, 
            message: 'Password reset OTP sent to your email' 
        };
    } catch (error) {
        throw new Error(`Failed to send password reset OTP: ${error.message}`);
    }
};

// Verify password reset OTP
const verifyPasswordResetOTP = async (email, otp) => {
    try {
        const admin = await Admin.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!admin) {
            throw new Error('Invalid or expired OTP');
        }

        return { 
            success: true, 
            message: 'OTP verified successfully' 
        };
    } catch (error) {
        throw new Error(`OTP verification failed: ${error.message}`);
    }
};

// Reset password after OTP verification
const resetPassword = async (email, otp, newPassword) => {
    try {
        const admin = await Admin.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!admin) {
            throw new Error('Invalid or expired OTP');
        }

        // Update password and clear reset fields
        await Admin.findByIdAndUpdate(admin._id, {
            password: newPassword,
            resetPasswordOTP: undefined,
            resetPasswordExpires: undefined
        });

        return { 
            success: true, 
            message: 'Password reset successfully' 
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
    resetPassword
};