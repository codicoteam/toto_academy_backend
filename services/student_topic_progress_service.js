const StudentTopicProgress = require("../models/student_topic_progress");
const Topic = require("../models/topic_in_subject");

// Start or update topic progress
// Update progress with lesson tracking
const updateTopicProgress = async (
  studentId,
  topicId,
  timeSpent = 0,
  lessonData = null
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    });

    if (!progress) {
      progress = new StudentTopicProgress({
        student: studentId,
        topic: topicId,
        status: "in_progress",
        startedAt: new Date(),
        lastAccessed: new Date(),
        timeSpent: timeSpent,
      });
    } else {
      progress.lastAccessed = new Date();
      progress.timeSpent += timeSpent;

      if (progress.status === "not_started") {
        progress.status = "in_progress";
        progress.startedAt = new Date();
      }
    }

    // Update lesson progress if provided
    if (lessonData) {
      progress.currentLessonIndex =
        lessonData.lessonIndex || progress.currentLessonIndex;
      progress.currentSubheadingIndex =
        lessonData.subheadingIndex || progress.currentSubheadingIndex;

      // Optional: Store reference to the actual lesson
      if (lessonData.lessonId) {
        progress.currentLesson = lessonData.lessonId;
      }
    }

    // Update daily progress (existing code)
    const dailyProgressIndex = progress.dailyProgress.findIndex(
      (dp) => dp.date.getTime() === today.getTime()
    );

    if (dailyProgressIndex === -1) {
      progress.dailyProgress.push({
        date: today,
        timeSpent: timeSpent,
        completed: false,
      });
    } else {
      progress.dailyProgress[dailyProgressIndex].timeSpent += timeSpent;
    }

    const uniqueDays = new Set(
      progress.dailyProgress.map((dp) => dp.date.getTime())
    ).size;

    progress.minimumTimeRequirementMet = uniqueDays >= 5;

    await progress.save();
    return await progress.populate(["topic", "currentLesson"]);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Mark topic as completed
const completeTopic = async (studentId, topicId) => {
  try {
    const progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    });

    if (!progress) {
      throw new Error("Progress record not found");
    }

    // Check if minimum time requirement is met
    if (!progress.minimumTimeRequirementMet) {
      throw new Error("Minimum 5-day requirement not met");
    }

    progress.status = "completed";
    progress.completedAt = new Date();

    await progress.save();
    return await progress.populate("topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get student's progress for a specific topic

// Get progress with populated lesson info
const getTopicProgress = async (studentId, topicId) => {
  try {
    const progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    })
      .populate("topic")
      .populate({
        path: "currentLesson",
        populate: {
          path: "subHeading",
          model: "topic_content.lesson.subHeading",
        },
      });

    if (!progress) {
      const topic = await Topic.findById(topicId);
      // Also get the topic content to provide default lesson info
      const topicContent = await TopicContent.findOne({ Topic: topicId });

      return {
        student: studentId,
        topic: topic,
        topicContent: topicContent,
        currentLessonIndex: 0,
        currentSubheadingIndex: 0,
        currentLesson: topicContent ? topicContent.lesson[0] : null,
        status: "not_started",
        startedAt: null,
        completedAt: null,
        lastAccessed: null,
        timeSpent: 0,
        minimumTimeRequirementMet: false,
        dailyProgress: [],
      };
    }

    // If currentLesson is not populated but we have indices, try to get the lesson
    if (!progress.currentLesson && progress.currentLessonIndex >= 0) {
      const topicContent = await TopicContent.findOne({ Topic: topicId });
      if (
        topicContent &&
        topicContent.lesson.length > progress.currentLessonIndex
      ) {
        progress.currentLesson =
          topicContent.lesson[progress.currentLessonIndex];
      }
    }

    return progress;
  } catch (error) {
    throw new Error(error.message);
  }
};

// New method to update lesson progress specifically
const updateLessonProgress = async (
  studentId,
  topicId,
  lessonIndex,
  subheadingIndex = 0,
  lessonId = null
) => {
  try {
    let progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    });

    if (!progress) {
      progress = new StudentTopicProgress({
        student: studentId,
        topic: topicId,
        status: "in_progress",
        startedAt: new Date(),
        lastAccessed: new Date(),
        timeSpent: 0,
      });
    }

    progress.currentLessonIndex = lessonIndex;
    progress.currentSubheadingIndex = subheadingIndex;
    progress.lastAccessed = new Date();

    if (lessonId) {
      progress.currentLesson = lessonId;
    }

    if (progress.status === "not_started") {
      progress.status = "in_progress";
      progress.startedAt = new Date();
    }

    await progress.save();
    return await progress.populate(["topic", "currentLesson"]);
  } catch (error) {
    throw new Error(error.message);
  }
};
// Get all topics progress for a student
const getAllTopicsProgress = async (studentId) => {
  try {
    const progressRecords = await StudentTopicProgress.find({
      student: studentId,
    }).populate("topic");

    return progressRecords;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get completed topics for a student
const getCompletedTopics = async (studentId) => {
  try {
    const completedTopics = await StudentTopicProgress.find({
      student: studentId,
      status: "completed",
    }).populate("topic");

    return completedTopics;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get in-progress topics for a student
const getInProgressTopics = async (studentId) => {
  try {
    const inProgressTopics = await StudentTopicProgress.find({
      student: studentId,
      status: "in_progress",
    }).populate("topic");

    return inProgressTopics;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Reset progress if student hasn't met the 5-day requirement in time
const checkAndResetStaleProgress = async (studentId, topicId) => {
  try {
    const progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    });

    if (!progress || progress.status === "completed") {
      return null;
    }

    const now = new Date();
    const lastAccessed = new Date(progress.lastAccessed);
    const daysSinceLastAccess = Math.floor(
      (now - lastAccessed) / (1000 * 60 * 60 * 24)
    );

    // If it's been more than 7 days since last access and requirement not met, reset progress
    if (daysSinceLastAccess > 7 && !progress.minimumTimeRequirementMet) {
      await StudentTopicProgress.deleteOne({
        student: studentId,
        topic: topicId,
      });
      return { reset: true, message: "Progress reset due to inactivity" };
    }

    return { reset: false, message: "No reset needed" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  updateTopicProgress,
  completeTopic,
  getTopicProgress,
  getAllTopicsProgress,
  getCompletedTopics,
  getInProgressTopics,
  checkAndResetStaleProgress,
  updateLessonProgress,
};
