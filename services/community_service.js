const Community = require("../models/community_model"); // Adjust path if necessary

// Create new community
const createCommunity = async (data) => {
  try {
    const newCommunity = new Community(data);
    await newCommunity.save();
    return newCommunity;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all communities
const getAllCommunities = async () => {
  try {
    return await Community.find()
      .populate("subject")
      .populate("students", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get community by ID
const getCommunityById = async (id) => {
  try {
    const community = await Community.findById(id)
      .populate("subject")
      .populate("students", "firstName lastName");

    if (!community) {
      throw new Error("Community not found");
    }
    return community;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get communities by subject ID
const getCommunitiesBySubjectId = async (subjectId) => {
  try {
    const communities = await Community.find({ subject: subjectId })
      .populate("subject")
      .populate("students", "firstName lastName");

    if (!communities || communities.length === 0) {
      throw new Error("No communities found for this subject");
    }
    return communities;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update community by ID
const updateCommunity = async (id, updateData) => {
  try {
    const updated = await Community.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("subject")
      .populate("students", "firstName lastName");

    if (!updated) {
      throw new Error("Community not found");
    }
    return updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete community by ID
const deleteCommunity = async (id) => {
  try {
    const deleted = await Community.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Community not found");
    }
    return deleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add a student to the community (join community)
const joinCommunity = async (communityId, studentId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // Avoid duplicates
    if (community.students.includes(studentId)) {
      throw new Error("Student already joined the community");
    }

    community.students.push(studentId);
    await community.save();

    return await Community.findById(communityId)
      .populate("subject")
      .populate("students", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove a student from the community (leave community)
const leaveCommunity = async (communityId, studentId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // Check if student is actually a member
    if (!community.students.includes(studentId)) {
      throw new Error("Student is not a member of the community");
    }

    // Remove the student from the list
    community.students = community.students.filter(
      (id) => id.toString() !== studentId.toString()
    );
    await community.save();

    return await Community.findById(communityId)
      .populate("subject")
      .populate("students", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add admin to community
const addAdminToCommunity = async (communityId, adminId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // Avoid duplicates
    if (community.admins.includes(adminId)) {
      throw new Error("Admin already added to the community");
    }

    community.admins.push(adminId);
    await community.save();

    return await Community.findById(communityId)
      .populate("subject")
      .populate("students", "firstName lastName")
      .populate("admins", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove admin from community
const removeAdminFromCommunity = async (communityId, adminId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // Check if admin is actually in the list
    if (!community.admins.includes(adminId)) {
      throw new Error("Admin is not a member of the community");
    }

    // Remove the admin from the list
    community.admins = community.admins.filter(
      (id) => id.toString() !== adminId.toString()
    );
    await community.save();

    return await Community.findById(communityId)
      .populate("subject")
      .populate("students", "firstName lastName")
      .populate("admins", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove student from community (admin function)
const removeStudentFromCommunity = async (communityId, studentId) => {
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // Check if student is actually a member
    if (!community.students.includes(studentId)) {
      throw new Error("Student is not a member of the community");
    }

    // Remove the student from the list
    community.students = community.students.filter(
      (id) => id.toString() !== studentId.toString()
    );
    await community.save();

    return await Community.findById(communityId)
      .populate("subject")
      .populate("students", "firstName lastName")
      .populate("admins", "firstName lastName");
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  leaveCommunity,
  createCommunity,
  getAllCommunities,
  getCommunityById,
  getCommunitiesBySubjectId,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  addAdminToCommunity,
  removeAdminFromCommunity,
  removeStudentFromCommunity,
};
