const Topic = require("../models/topic_in_subject"); // Adjust the path as needed

// Create new topic
const createTopic = async (topicData) => {
  try {
    const newTopic = new Topic(topicData);
    await newTopic.save();
    return newTopic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all topics
const getAllTopics = async () => {
  try {
    return await Topic.find().populate("subject"); // populate subject for more details if needed
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get topic by ID
const getTopicById = async (id) => {
  try {
    const topic = await Topic.findById(id).populate("subject");
    if (!topic) {
      throw new Error("Topic not found");
    }
    return topic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update topic by ID
const updateTopic = async (id, updateData) => {
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedTopic) {
      throw new Error("Topic not found");
    }
    return updatedTopic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete topic by ID
const deleteTopic = async (id) => {
  try {
    const deletedTopic = await Topic.findByIdAndDelete(id);
    if (!deletedTopic) {
      throw new Error("Topic not found");
    }
    return deletedTopic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get topics by subject ID (exclude trashed)
const getTopicsBySubjectId = async (subjectId) => {
  try {
    const topics = await Topic.find({
      subject: subjectId,
      isDeleted: false, // exclude items in trash
    }).populate("subject");

    if (!topics || topics.length === 0) {
      throw new Error("No topics found for this subject");
    }
    return topics;
  } catch (error) {
    throw new Error(error.message);
  }
};


// Service: topicService.js
const getRandomFiveTopicsBySubjectId = async (subjectId) => {
  try {
    // Use aggregation with $match and $sample for random selection
    const topics = await Topic.aggregate([
      { $match: { subject: mongoose.Types.ObjectId(subjectId) } },
      { $sample: { size: 5 } }, // Pick 5 random documents
    ]);

    if (!topics || topics.length === 0) {
      throw new Error("No topics found for this subject");
    }

    return topics;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Increment topicRequests by 1 for a subject
const incrementTopiComentcRequests = async (id) => {
  try {
    const updatedSubject = await Topic.findByIdAndUpdate(
      id,
      { $inc: { topicContentRequests: 1 } }, // atomic increment
      { new: true }
    );
    if (!updatedSubject) {
      throw new Error("Topic not found");
    }
    return updatedSubject;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Soft delete (move to trash)
const softDeleteTopic = async (id) => {
  try {
    const topic = await Topic.findById(id);
    if (!topic) throw new Error("Topic not found");

    if (!topic.isDeleted) {
      topic.isDeleted = true;
      topic.deletedAt = new Date();
      await topic.save();
    }
    return topic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Restore from trash
const restoreTopic = async (id) => {
  try {
    const topic = await Topic.findById(id);
    if (!topic) throw new Error("Topic not found");

    if (topic.isDeleted) {
      topic.isDeleted = false;
      topic.deletedAt = null;
      await topic.save();
    }
    return topic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View topics in trash
const getDeletedTopics = async () => {
  try {
    return await Topic.find({ isDeleted: true }).populate("subject");
  } catch (error) {
    throw new Error(error.message);
  }
};

// (Optional) Permanently delete **from trash**
const permanentDeleteTopic = async (id) => {
  try {
    return await Topic.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  getRandomFiveTopicsBySubjectId,
  getTopicsBySubjectId,
  incrementTopiComentcRequests,
  softDeleteTopic,
  restoreTopic,
  getDeletedTopics,
  permanentDeleteTopic, // optional
};
