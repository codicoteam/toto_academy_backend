const CommunityMessage = require("../models/message_community_model"); // Adjust path if necessary

// Create new community message
const createCommunityMessage = async (data) => {
  try {
    const newMessage = new CommunityMessage(data);
    await newMessage.save();
    return await newMessage.populate([
      { path: "community" },
      { path: "sender", select: "firstName lastName" }
    ]);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all messages for a community
const getCommunityMessages = async (communityId) => {
  try {
    const messages = await CommunityMessage.find({ community: communityId })
      .populate([
        { path: "community" },
        { path: "sender", select: "firstName lastName" }
      ])
      .sort({ timestamp: -1 });

    if (!messages || messages.length === 0) {
      throw new Error("No messages found for this community");
    }
    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get message by ID
const getMessageById = async (id) => {
  try {
    const message = await CommunityMessage.findById(id)
      .populate([
        { path: "community" },
        { path: "sender", select: "firstName lastName" }
      ]);

    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update message by ID
const updateMessage = async (id, updateData) => {
  try {
    const updated = await CommunityMessage.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate([
      { path: "community" },
      { path: "sender", select: "firstName lastName" }
    ]);

    if (!updated) {
      throw new Error("Message not found");
    }
    return updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete message by ID
const deleteMessage = async (id) => {
  try {
    const deleted = await CommunityMessage.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Message not found");
    }
    return deleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get messages by sender ID
const getMessagesBySenderId = async (senderId) => {
  try {
    const messages = await CommunityMessage.find({ sender: senderId })
      .populate([
        { path: "community" },
        { path: "sender", select: "firstName lastName" }
      ])
      .sort({ timestamp: -1 });

    if (!messages || messages.length === 0) {
      throw new Error("No messages found for this sender");
    }
    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createCommunityMessage,
  getCommunityMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessagesBySenderId
};