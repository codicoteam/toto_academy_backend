const Chat = require("../models/admin_student_chat_model");
const mongoose = require("mongoose");

// Send a message
const sendMessage = async (data) => {
  try {
    const message = new Chat(data);
    await message.save();
    return message;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get all messages between a student and an admin
const getConversation = async (studentId, adminId) => {
  try {
    return await Chat.find({
      $or: [
        { sender: studentId, receiver: adminId },
        { sender: adminId, receiver: studentId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender")
      .populate("receiver");
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get conversations for admin (grouped by student with last message)
// Get conversations for admin (grouped by student with last message)
const getAdminConversations = async (adminId) => {
  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId); // fix
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: adminObjectId, receiverModel: "Student" },
            { receiver: adminObjectId, senderModel: "Student" }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", adminObjectId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          studentId: {
            $first: {
              $cond: [
                { $eq: ["$sender", adminObjectId] },
                "$receiver",
                "$sender"
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          student: {
            _id: "$student._id",
            firstName: "$student.firstName",
            la
            email: "$student.email"
          },
          lastMessage: {
            _id: "$lastMessage._id",
            message: "$lastMessage.message",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            viewed: "$lastMessage.viewed",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt"
          }
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    return conversations;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get conversations for student (grouped by admin with last message)
const getStudentConversations = async (studentId) => {
  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId); // fix
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: studentObjectId, receiverModel: "Admin" },
            { receiver: studentObjectId, senderModel: "Admin" }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", studentObjectId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          adminId: {
            $first: {
              $cond: [
                { $eq: ["$sender", studentObjectId] },
                "$receiver",
                "$sender"
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "admins",
          localField: "adminId",
          foreignField: "_id",
          as: "admin"
        }
      },
      { $unwind: "$admin" },
      {
        $project: {
          _id: 0,
          admin: {
            _id: "$admin._id",
            name: "$admin.name",
            email: "$admin.email"
          },
          lastMessage: {
            _id: "$lastMessage._id",
            message: "$lastMessage.message",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            viewed: "$lastMessage.viewed",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt"
          }
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    return conversations;
  } catch (err) {
    throw new Error(err.message);
  }
};


// Mark messages as viewed
const markMessagesAsViewed = async (studentId, adminId) => {
  try {
    const result = await Chat.updateMany(
      {
        sender: studentId,
        receiver: adminId,
        viewed: false,
      },
      { $set: { viewed: true } }
    );
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Delete a whole chat (all messages between student and admin)
const deleteConversation = async (studentId, adminId) => {
  try {
    const result = await Chat.deleteMany({
      $or: [
        { sender: studentId, receiver: adminId },
        { sender: adminId, receiver: studentId },
      ],
    });
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Delete a single message by ID
const deleteMessage = async (messageId) => {
  try {
    const result = await Chat.findByIdAndDelete(messageId);
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAdminConversations,
  getStudentConversations,
  markMessagesAsViewed,
  deleteConversation,
  deleteMessage,
};