const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
        enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"],
      },
    address: {
        type: String,
        required: true,
    },
    school: {
        type: String,
        required: true,
    },
    subjects: {
        type: [String],
        required: true,
    },
    subscription_status: {
        type: String,
        enum: ["active", "inactive", "pending"],
        default: "inactive",
    },
    profile_picture: {
        type: String,
        required: false,
    },
    next_of_kin_full_name: {
        type: String,
        required: true,
    },
    next_of_kin_phone_number: {
        type: String,
        required: true,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Hash password before updating a student
studentSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }

    next();
});

module.exports = mongoose.model("Student", studentSchema);