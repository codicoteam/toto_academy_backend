const Content = require("../models/content_system"); // Adjust path as needed

// Create new content
const createContent = async (contentData) => {
  try {
    const newContent = new Content(contentData);
    await newContent.save();
    return newContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all content (now with subject populated)
const getAllContent = async () => {
  try {
    return await Content.find().populate("subject");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get content by ID (now with subject populated)
const getContentById = async (id) => {
  try {
    const content = await Content.findById(id).populate("subject");
    if (!content) {
      throw new Error("Content not found");
    }
    return content;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update content by ID (returns populated subject after update)
const updateContent = async (id, updateData) => {
  try {
    const updatedContent = await Content.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("subject");

    if (!updatedContent) {
      throw new Error("Content not found");
    }
    return updatedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete content by ID (no need to populate for deletion)
const deleteContent = async (id) => {
  try {
    const deletedContent = await Content.findByIdAndDelete(id);
    if (!deletedContent) {
      throw new Error("Content not found");
    }
    return deletedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};
