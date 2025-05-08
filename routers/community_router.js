const express = require("express");
const router = express.Router();
const communityService = require("../services/community_service"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new community
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newCommunity = await communityService.createCommunity(req.body);
    res.status(201).json({
      message: "Community created successfully",
      data: newCommunity,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create community",
      error: error.message,
    });
  }
});

// Get all communities
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const communities = await communityService.getAllCommunities();
    res.status(200).json({
      message: "Communities retrieved successfully",
      data: communities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve communities",
      error: error.message,
    });
  }
});

// Get community by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const community = await communityService.getCommunityById(req.params.id);
    res.status(200).json({
      message: "Community retrieved successfully",
      data: community,
    });
  } catch (error) {
    res.status(404).json({
      message: "Community not found",
      error: error.message,
    });
  }
});

// Get communities by subject ID
router.get("/subject/:subjectId", authenticateToken, async (req, res) => {
  try {
    const communities = await communityService.getCommunitiesBySubjectId(
      req.params.subjectId
    );
    res.status(200).json({
      message: "Communities retrieved successfully",
      data: communities,
    });
  } catch (error) {
    res.status(404).json({
      message: "No communities found",
      error: error.message,
    });
  }
});

// Update community by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await communityService.updateCommunity(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Community updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update community",
      error: error.message,
    });
  }
});

// Delete community by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await communityService.deleteCommunity(req.params.id);
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete community",
      error: error.message,
    });
  }
});

// Join community (Add student to community)
router.post("/join/:communityId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;
    const updatedCommunity = await communityService.joinCommunity(
      req.params.communityId,
      studentId
    );
    res.status(200).json({
      message: "Student joined the community successfully",
      data: updatedCommunity,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to join community",
      error: error.message,
    });
  }
});

// Leave community (Remove student from community)
router.post("/leave/:communityId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;
    const updatedCommunity = await communityService.leaveCommunity(
      req.params.communityId,
      studentId
    );
    res.status(200).json({
      message: "Student left the community successfully",
      data: updatedCommunity,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to leave community",
      error: error.message,
    });
  }
});

module.exports = router;
