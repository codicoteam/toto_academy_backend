const express = require("express");
const router = express.Router();
const communityMessageService = require("../services/message_community_services");

// Create new community message
router.post("/create", async (req, res) => {
  try {
    const messageData = {
      community: req.body.community,
      sender: req.body.sender, // must be a valid ObjectId of Student or Admin
      senderModel: req.body.senderModel, // "Student" or "Admin"
      message: req.body.message,
      imagePath: req.body.imagePath || [],
    };

    const newMessage = await communityMessageService.createCommunityMessage(
      messageData
    );
    res.status(201).json({
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create message",
      error: error.message,
    });
  }
});

// Get all messages for a community
router.get("/community/:communityId", async (req, res) => {
  try {
    const messages = await communityMessageService.getCommunityMessages(
      req.params.communityId
    );
    res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    res.status(404).json({
      message: "No messages found",
      error: error.message,
    });
  }
});

// Get message by ID
router.get("/get/:id", async (req, res) => {
  try {
    const message = await communityMessageService.getMessageById(req.params.id);
    res.status(200).json({
      message: "Message retrieved successfully",
      data: message,
    });
  } catch (error) {
    res.status(404).json({
      message: "Message not found",
      error: error.message,
    });
  }
});

// Update message by ID
router.put("/update/:id", async (req, res) => {
  try {
    const updatedMessage = await communityMessageService.updateMessage(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update message",
      error: error.message,
    });
  }
});

// Delete message by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    await communityMessageService.deleteMessage(req.params.id);
    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete message",
      error: error.message,
    });
  }
});

// Get messages by sender ID
router.get("/sender/:senderId", async (req, res) => {
  try {
    const messages = await communityMessageService.getMessagesBySenderId(
      req.params.senderId
    );
    res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    res.status(404).json({
      message: "No messages found for this sender",
      error: error.message,
    });
  }
});

module.exports = router;
