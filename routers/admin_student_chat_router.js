const express = require("express");
const router = express.Router();
const chatService = require("../services/admin_student_chat_service");
const { authenticateToken } = require("../middlewares/auth");

// Send a message
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const message = await chatService.sendMessage(req.body);
    res
      .status(201)
      .json({ message: "Message sent successfully", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation between a student and an admin
router.get(
  "/conversation/:studentId/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, adminId } = req.params;
      const conversation = await chatService.getConversation(
        studentId,
        adminId
      );
      res
        .status(200)
        .json({ message: "Conversation retrieved", data: conversation });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Mark messages as viewed
router.put(
  "/mark-viewed/:studentId/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, adminId } = req.params;
      const result = await chatService.markMessagesAsViewed(studentId, adminId);
      res
        .status(200)
        .json({ message: "Messages marked as viewed", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete a whole conversation
router.delete(
  "/conversation/:studentId/:adminId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, adminId } = req.params;
      const result = await chatService.deleteConversation(studentId, adminId);
      res.status(200).json({ message: "Conversation deleted", data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete a single message
router.delete("/message/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const result = await chatService.deleteMessage(messageId);
    if (!result) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
