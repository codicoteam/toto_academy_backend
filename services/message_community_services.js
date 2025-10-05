const CommunityMessage = require("../models/message_community_model");

// Create new community message
const createCommunityMessage = async (data) => {
  try {
    const newMessage = new CommunityMessage(data);
    await newMessage.save();

    // Dynamic population based on sender type
    const populateOptions = [
      { path: "community" },
      {
        path: "sender",
        select:
          data.senderModel === "Student"
            ? "firstName lastName profilePicture"
            : "name email profilePicture",
      },
    ];

    return await newMessage.populate(populateOptions);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all messages for a community
const getCommunityMessages = async (communityId) => {
  try {
    const messages = await CommunityMessage.find({ community: communityId })
      .populate("community")
      .populate({
        path: "sender",
        select: "firstName lastName name email profilePicture profile_picture",
      })
      .sort({ timestamp: -1 })
      .lean();

    if (!messages?.length) return [];

    const formattedMessages = messages.map((msg) => {
      if (msg.senderModel === "Student") {
        msg.sender = {
          _id: msg.sender?._id,
          firstName: msg.sender?.firstName || "",
          lastName: msg.sender?.lastName || "",
          profilePicture: msg.sender?.profile_picture || "",
        };
      } else if (msg.senderModel === "Admin") {
        msg.sender = {
          _id: msg.sender?._id,
          name: `${msg.sender?.firstName || ""} ${msg.sender?.lastName || ""}`.trim(),
          email: msg.sender?.email || "",
          profilePicture: msg.sender?.profilePicture || "",
        };
      }
      return msg;
    });

    return formattedMessages;
  } catch (error) {
    throw new Error(error.message);
  }
};



// Get message by ID
const getMessageById = async (id) => {
  try {
    const message = await CommunityMessage.findById(id).populate([
      { path: "community" },
      {
        path: "sender",
        // Select different fields based on sender type
        select: function () {
          return this.senderModel === "Student"
            ? "firstName lastName profilePicture"
            : "name email profilePicture";
        },
      },
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
      {
        path: "sender",
        // Select different fields based on sender type
        select: function () {
          return this.senderModel === "Student"
            ? "firstName lastName profilePicture"
            : "name email profilePicture";
        },
      },
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
        {
          path: "sender",
          // Select different fields based on sender type
          select: function () {
            return this.senderModel === "Student"
              ? "firstName lastName profilePicture"
              : "name email profilePicture";
          },
        },
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
  getMessagesBySenderId,
};
