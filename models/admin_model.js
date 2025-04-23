const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Hash password before updating a client
adminSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    
    // Check if password is being updated
    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }
    
    next();
});


module.exports = mongoose.model("Admin", adminSchema);