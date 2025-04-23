const Content = require('../models/content_system'); // Adjust path as needed

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

// Get all content
const getAllContent = async () => {
    try {
        return await Content.find();
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get content by ID
const getContentById = async (id) => {
    try {
        const content = await Content.findById(id);
        if (!content) {
            throw new Error('Content not found');
        }
        return content;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Update content by ID
const updateContent = async (id, updateData) => {
    try {
        const updatedContent = await Content.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedContent) {
            throw new Error('Content not found');
        }
        return updatedContent;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete content by ID
const deleteContent = async (id) => {
    try {
        const deletedContent = await Content.findByIdAndDelete(id);
        if (!deletedContent) {
            throw new Error('Content not found');
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
