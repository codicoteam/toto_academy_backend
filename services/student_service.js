const Student = require('../models/student_model'); // Adjust the path as per your project structure
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
            throw new Error('Email already exists');
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
        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedStudent) {
            throw new Error('Student not found');
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
            throw new Error('Student not found');
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
            throw new Error('Phone number not found');
        }

        // Format the phone number for Twilio (assuming it needs + prefix)
        const formattedNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;

        // Send OTP via Twilio Verify
        const verification = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID)
            .verifications
            .create({ to: formattedNumber, channel: 'sms' });

        return { 
            success: true, 
            message: 'OTP sent successfully', 
            verificationSid: verification.sid 
        };
    } catch (error) {
        throw new Error(`Failed to send OTP: ${error.message}`);
    }
};

// Service to verify OTP
const verifyOTP = async (phone_number, otpCode) => {
    try {
        // Format the phone number for Twilio
        const formattedNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;

        // Verify the OTP with Twilio
        const verificationCheck = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID)
            .verificationChecks
            .create({ to: formattedNumber, code: otpCode });

        if (verificationCheck.status === 'approved') {
            // Update the phone verification status in the database
            await Student.findOneAndUpdate(
                { phone_number },
                { isPhoneVerified: true }
            );
            return { success: true, message: 'OTP verified successfully' };
        } else {
            throw new Error('Invalid OTP code');
        }
    } catch (error) {
        throw new Error(`OTP verification failed: ${error.message}`);
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentByEmail,
    getStudentByPhoneNumber,
    updateStudent,
    deleteStudent,
    generateAndSendOTP,
    verifyOTP,
};