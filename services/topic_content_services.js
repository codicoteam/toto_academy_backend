const TopicContent = require("../models/topic_content_model"); // Adjust the path as needed

// Create new topic content
const createTopicContent = async (data) => {
  try {
    const newContent = new TopicContent(data);
    await newContent.save();
    return newContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all topic contents
const getAllTopicContents = async () => {
  try {
    return await TopicContent.find().populate("Topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get topic content by ID
const getTopicContentById = async (id) => {
  try {
    const content = await TopicContent.findById(id).populate("Topic");
    if (!content) {
      throw new Error("Topic content not found");
    }
    return content;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Get topic contents by Topic ID
const getTopicContentByTopicId = async (topicId) => {
  try {
    const contents = await TopicContent.find({ Topic: topicId }).populate("Topic");
    if (!contents || contents.length === 0) {
      throw new Error("No content found for the specified Topic ID");
    }
    return contents;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update topic content by ID
const updateTopicContent = async (id, updateData) => {
  try {
    const updatedContent = await TopicContent.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("Topic");
    if (!updatedContent) {
      throw new Error("Topic content not found");
    }
    return updatedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete topic content by ID
const deleteTopicContent = async (id) => {
  try {
    const deletedContent = await TopicContent.findByIdAndDelete(id);
    if (!deletedContent) {
      throw new Error("Topic content not found");
    }
    return deletedContent;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createTopicContent,
  getAllTopicContents,
  getTopicContentById,
  getTopicContentByTopicId,
  updateTopicContent,
  deleteTopicContent,
};
