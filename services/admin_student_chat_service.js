const Chat = require("../models/admin_student_chat_model");

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
  markMessagesAsViewed,
  deleteConversation,
  deleteMessage,
};
