const Admin = require('../models/admin_model'); // Adjust the path as per your project structure

// Service to create a new admin
const createAdmin = async (adminData) => {
    try {
        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            throw new Error('Email already exists');
        }

        // Create and save a new admin
        const newAdmin = new Admin(adminData);
        await newAdmin.save();
        return newAdmin;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to get all admins
const getAllAdmins = async () => {
    try {
        return await Admin.find();
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service to fetch an admin by email
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

module.exports = {
    createAdmin,
    getAllAdmins,
    getAdminByEmail,
    updateAdmin,
    deleteAdmin,
};