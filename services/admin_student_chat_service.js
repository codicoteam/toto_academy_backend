const Chat = require("../models/admin_student_chat_model");
const mongoose = require("mongoose");

// Send a message
const sendMessage = async (data) => {
  try {

    const message = new Chat(data);
    await message.save();
    
    // Populate the references for immediate use
    await message.populate([
      { path: "sender", select: "firstName lastName profile_picture email" },
      { path: "receiver", select: "firstName lastName profile_picture email" },
      { path: "topicContentId", select: "title description" }
    ]);
    
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
      .populate("sender", "firstName lastName profile_picture email")
      .populate("receiver", "firstName lastName profile_picture email")
      .populate("topicContentId", "title description");
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get messages related to specific topic content
const getTopicContentMessages = async (topicContentId, lessonInfoId = null) => {
  try {
    const query = { topicContentId };
    
    if (lessonInfoId) {
      query.lessonInfoId = lessonInfoId;
    }
    
    return await Chat.find(query)
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName profile_picture email")
      .populate("receiver", "firstName lastName profile_picture email")
      .populate("topicContentId", "title description");
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get conversations for admin (grouped by student with last message)
const getAdminConversations = async (adminId) => {
  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: adminObjectId, receiverModel: "Student" },
            { receiver: adminObjectId, senderModel: "Student" },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", adminObjectId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          studentId: {
            $first: {
              $cond: [
                { $eq: ["$sender", adminObjectId] },
                "$receiver",
                "$sender",
              ],
            },
          },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$receiver", adminObjectId] },
                    { $eq: ["$viewed", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          student: {
            _id: "$student._id",
            firstName: "$student.firstName",
            lastName: "$student.lastName",
            profile_picture: "$student.profile_picture",
            email: "$student.email",
          },
          lastMessage: {
            _id: "$lastMessage._id",
            message: "$lastMessage.message",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            viewed: "$lastMessage.viewed",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt",
            imageAttached: "$lastMessage.imageAttached",
            topicContentId: "$lastMessage.topicContentId",
            lessonInfoId: "$lastMessage.lessonInfoId",
            messageType: "$lastMessage.messageType"
          },
          unreadCount: 1
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Populate topicContentId for lastMessage
    for (let conv of conversations) {
      if (conv.lastMessage.topicContentId) {
        const topicContent = await mongoose.model("topic_content").findById(
          conv.lastMessage.topicContentId,
          "title description"
        );
        conv.lastMessage.topicContent = topicContent;
      }
    }

    return conversations;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get conversations for student (grouped by admin with last message)
const getStudentConversations = async (studentId) => {
  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: studentObjectId, receiverModel: "Admin" },
            { receiver: studentObjectId, senderModel: "Admin" },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", studentObjectId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          adminId: {
            $first: {
              $cond: [
                { $eq: ["$sender", studentObjectId] },
                "$receiver",
                "$sender",
              ],
            },
          },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$receiver", studentObjectId] },
                    { $eq: ["$viewed", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "adminId",
          foreignField: "_id",
          as: "admin",
        },
      },
      { $unwind: "$admin" },
      {
        $project: {
          _id: 0,
          admin: {
            _id: "$admin._id",
            firstName: "$admin.firstName",
            lastName: "$admin.lastName",
            profile_picture: "$admin.profile_picture",            
            email: "$admin.email",
          },
          lastMessage: {
            _id: "$lastMessage._id",
            message: "$lastMessage.message",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            viewed: "$lastMessage.viewed",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt",
            imageAttached: "$lastMessage.imageAttached",
            topicContentId: "$lastMessage.topicContentId",
            lessonInfoId: "$lastMessage.lessonInfoId",
            messageType: "$lastMessage.messageType"
          },
          unreadCount: 1
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);
    
    // Populate topicContentId for lastMessage
    for (let conv of conversations) {
      if (conv.lastMessage.topicContentId) {
        const topicContent = await mongoose.model("topic_content").findById(
          conv.lastMessage.topicContentId,
          "title description"
        );
        conv.lastMessage.topicContent = topicContent;
      }
    }
    
    return conversations;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Mark messages as viewed
const markMessagesAsViewed = async (userId, conversationPartnerId) => {
  try {
    const result = await Chat.updateMany(
      {
        sender: conversationPartnerId,
        receiver: userId,
        viewed: false,
      },
      { $set: { viewed: true } }
    );
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Mark a specific message as viewed
const markMessageAsViewed = async (messageId) => {
  try {
    const result = await Chat.findByIdAndUpdate(
      messageId,
      { $set: { viewed: true } },
      { new: true }
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

// Get unread message count for a user
const getUnreadCount = async (userId) => {
  try {
    const count = await Chat.countDocuments({
      receiver: userId,
      viewed: false
    });
    return count;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getTopicContentMessages,
  getAdminConversations,
  getStudentConversations,
  markMessagesAsViewed,
  markMessageAsViewed,
  deleteConversation,
  deleteMessage,
  getUnreadCount
};