const Student = require("../models/student_model");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Service to create a new student
const createStudent = async (studentData) => {
  try {
    // Check if email already exists
    const existingStudent = await Student.findOne({ email: studentData.email });
    if (existingStudent) {
      throw new Error("Email already exists");
    }

    // Create and save the new student
    const newStudent = new Student(studentData);
    await newStudent.save();
    return newStudent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to get all students
const getAllStudents = async () => {
  try {
    return await Student.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to get student by email
const getStudentByEmail = async (email) => {
  try {
    return await Student.findOne({ email });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to get student by phone number
const getStudentByPhoneNumber = async (phone_number) => {
  try {
    return await Student.findOne({ phone_number });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to update a student
const updateStudent = async (id, updateData) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedStudent) {
      throw new Error("Student not found");
    }
    return updatedStudent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to delete a student
const deleteStudent = async (id) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      throw new Error("Student not found");
    }
    return deletedStudent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Service to generate and send OTP via SMS
const generateAndSendOTP = async (phone_number) => {
  try {
    // First check if the phone number exists in the database
    const student = await Student.findOne({ phone_number });
    if (!student) {
      throw new Error("Phone number not found");
    }

    // Format the phone number for Twilio (assuming it needs + prefix)
    const formattedNumber = phone_number.startsWith("+")
      ? phone_number
      : `+${phone_number}`;

    // Send OTP via Twilio Verify
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({ to: formattedNumber, channel: "sms" });

    return {
      success: true,
      message: "OTP sent successfully",
      verificationSid: verification.sid,
    };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Service to verify OTP
const verifyOTP = async (phone_number, otpCode) => {
  try {
    // Format the phone number for Twilio
    const formattedNumber = phone_number.startsWith("+")
      ? phone_number
      : `+${phone_number}`;

    // Verify the OTP with Twilio
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({ to: formattedNumber, code: otpCode });

    if (verificationCheck.status === "approved") {
      // Update the phone verification status in the database
      await Student.findOneAndUpdate(
        { phone_number },
        { isPhoneVerified: true }
      );
      return { success: true, message: "OTP verified successfully" };
    } else {
      throw new Error("Invalid OTP code");
    }
  } catch (error) {
    throw new Error(`OTP verification failed: ${error.message}`);
  }
};

// Service to generate and send password reset OTP via SMS
const generateAndSendPasswordResetOTP = async (email) => {
  try {
    // Check if email exists
    const student = await Student.findOne({ email });
    if (!student) {
      throw new Error("Email not found");
    }

    // Format the phone number for Twilio
    const formattedNumber = student.phone_number.startsWith("+")
      ? student.phone_number
      : `+${student.phone_number}`;

    // Send OTP via Twilio Verify
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({ to: formattedNumber, channel: "sms" });

    // Store the verification SID instead of generating our own OTP
    await Student.findByIdAndUpdate(student._id, {
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

// Verify password reset OTP
const verifyPasswordResetOTP = async (email, otpCode) => {
  try {
    const student = await Student.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!student) {
      throw new Error("OTP expired or invalid request");
    }

    // Format the phone number for Twilio
    const formattedNumber = student.phone_number.startsWith("+")
      ? student.phone_number
      : `+${student.phone_number}`;

    // Verify the OTP with Twilio using the stored verification SID
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: formattedNumber,
        code: otpCode,
        verificationSid: student.resetPasswordVerificationSid,
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
// Reset password after OTP verification
const resetPassword = async (email, newPassword) => {
  try {
    const student = await Student.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!student) {
      throw new Error("OTP expired or invalid request");
    }

    // Update password and clear reset fields
    await Student.findByIdAndUpdate(student._id, {
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

// Dashboard stats service
const getDashboardStats = async () => {
  try {
    const totalStudents = await Student.countDocuments();

    const levelCounts = await Student.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);

    const subscriptionStats = await Student.aggregate([
      { $group: { _id: "$subscription_status", count: { $sum: 1 } } },
    ]);

    const phoneVerificationCount = await Student.aggregate([
      {
        $group: {
          _id: "$isPhoneVerified",
          count: { $sum: 1 },
        },
      },
    ]);

    const subjectPopularity = await Student.aggregate([
      { $unwind: "$subjects" },
      { $group: { _id: "$subjects", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }, // Top 5 popular subjects
    ]);

    const studentsPerSchool = await Student.aggregate([
      { $group: { _id: "$school", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalStudents,
      levels: levelCounts,
      subscriptionStatus: subscriptionStats,
      phoneVerificationStats: phoneVerificationCount,
      topSubjects: subjectPopularity,
      studentsPerSchool,
    };
  } catch (error) {
    throw new Error("Failed to fetch dashboard stats: " + error.message);
  }
};

// Service to approve profile picture
const approveProfilePicture = async (studentId) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        profile_picture_status: "approved",
        profile_picture_rejection_reason: undefined,
      },
      { new: true }
    );

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return updatedStudent;
  } catch (error) {
    throw new Error(`Failed to approve profile picture: ${error.message}`);
  }
};

// Service to reject profile picture with reason
const rejectProfilePicture = async (studentId, rejectionReason) => {
  try {
    if (!rejectionReason || rejectionReason.trim() === "") {
      throw new Error("Rejection reason is required");
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        profile_picture_status: "rejected",
        profile_picture_rejection_reason: rejectionReason.trim(),
      },
      { new: true }
    );

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return updatedStudent;
  } catch (error) {
    throw new Error(`Failed to reject profile picture: ${error.message}`);
  }
};

// Service to get students with pending profile pictures
const getStudentsWithPendingProfilePictures = async () => {
  try {
    return await Student.find({
      profile_picture: { $exists: true, $ne: null },
      profile_picture_status: "pending",
    }).select("firstName lastName email profile_picture");
  } catch (error) {
    throw new Error(
      `Failed to fetch students with pending profile pictures: ${error.message}`
    );
  }
};

// Service to update profile picture (for student use)
const updateProfilePicture = async (studentId, profilePictureUrl) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        profile_picture: profilePictureUrl,
        profile_picture_status: "pending",
        profile_picture_rejection_reason: undefined,
      },
      { new: true }
    );

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return updatedStudent;
  } catch (error) {
    throw new Error(`Failed to update profile picture: ${error.message}`);
  }
};

module.exports = {
  getDashboardStats,
  createStudent,
  getAllStudents,
  getStudentByEmail,
  getStudentByPhoneNumber,
  updateStudent,
  deleteStudent,
  generateAndSendOTP,
  verifyOTP,
  generateAndSendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  approveProfilePicture,
  rejectProfilePicture,
  getStudentsWithPendingProfilePictures,
  updateProfilePicture,
};
