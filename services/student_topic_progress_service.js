const StudentTopicProgress = require("../models/student_topic_progress");
const Topic = require("../models/topic_content");
// ---------- Helpers ----------
function normalizeToday(d = new Date()) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

function clampPct(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function upsertLesson(progressDoc, payload) {
  if (!progressDoc.lessonsProgress) progressDoc.lessonsProgress = [];

  const {
    lessonid = null,
    lessonTitle, // preferred input name
    LesoonTitle, // typo supported as fallback
    totalGot,
    percentage,
    completed,
  } = payload;

  // Always store in schema's field name "LesoonTitle"
  const titleToStore = LesoonTitle ?? lessonTitle ?? "";

  // Find by lessonid first (if present), else by title
  let idx = -1;
  if (lessonid) {
    idx = progressDoc.lessonsProgress.findIndex(
      (l) => String(l.lessonid || "") === String(lessonid)
    );
  }
  if (idx === -1 && titleToStore) {
    idx = progressDoc.lessonsProgress.findIndex(
      (l) => (l.LesoonTitle || "") === titleToStore
    );
  }

  if (idx === -1) {
    progressDoc.lessonsProgress.push({
      lessonid: lessonid ?? undefined,
      LesoonTitle: titleToStore,
      totalGot: typeof totalGot === "number" ? Math.max(0, totalGot) : 0,
      percentage: clampPct(percentage ?? 0),
      completed: !!completed,
      updatedAt: new Date(),
    });
  } else {
    const l = progressDoc.lessonsProgress[idx];
    if (lessonid) l.lessonid = lessonid;
    if (titleToStore) l.LesoonTitle = titleToStore;
    if (typeof totalGot === "number") l.totalGot = Math.max(0, totalGot);
    if (typeof percentage === "number") l.percentage = clampPct(percentage);
    if (typeof completed === "boolean") l.completed = completed;
    l.updatedAt = new Date();
    progressDoc.markModified(`lessonsProgress.${idx}`);
  }
}

function recomputeRollups(progressDoc) {
  const lessons = Array.isArray(progressDoc.lessonsProgress)
    ? progressDoc.lessonsProgress
    : [];

  const overallTotalGot = lessons.reduce((s, l) => s + (l.totalGot || 0), 0);
  const overallPercentage =
    lessons.length > 0
      ? lessons.reduce((s, l) => s + (l.percentage || 0), 0) / lessons.length
      : 0;

  progressDoc.overallTotalGot = Math.max(0, Math.floor(overallTotalGot));
  progressDoc.overallPercentage =
    Math.round(clampPct(overallPercentage) * 100) / 100;

  const hasLessons = lessons.length > 0;
  const allCompleted = hasLessons && lessons.every((l) => !!l.completed);
  const anyProgress =
    hasLessons &&
    lessons.some((l) => (l.percentage || 0) > 0 || (l.totalGot || 0) > 0);

  if (allCompleted) {
    progressDoc.status = "completed";
    if (!progressDoc.completedAt) progressDoc.completedAt = new Date();
  } else if (anyProgress || (progressDoc.timeSpent || 0) > 0) {
    if (progressDoc.status === "not_started") {
      progressDoc.status = "in_progress";
      progressDoc.startedAt = progressDoc.startedAt || new Date();
    } else {
      progressDoc.status = "in_progress";
    }
    progressDoc.completedAt = null;
  } else {
    progressDoc.status = "not_started";
    progressDoc.completedAt = null;
  }
}

// ---------- Service Methods ----------

// Start or update topic progress (now supports lesson updates)
const updateTopicProgress = async (
  studentId,
  topicId,
  timeSpent = 0,
  lessonData = null
) => {
  try {
    const today = normalizeToday();

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
        timeSpent: timeSpent || 0,
      });
    } else {
      progress.lastAccessed = new Date();
      progress.timeSpent += timeSpent || 0;

      if (progress.status === "not_started") {
        progress.status = "in_progress";
        progress.startedAt = progress.startedAt || new Date();
      }
    }

    // Optional lesson location pointers (indices)
    if (
      lessonData &&
      (lessonData.lessonIndex !== undefined ||
        lessonData.subheadingIndex !== undefined)
    ) {
      if (typeof lessonData.lessonIndex === "number")
        progress.currentLessonIndex = lessonData.lessonIndex;
      if (typeof lessonData.subheadingIndex === "number")
        progress.currentSubheadingIndex = lessonData.subheadingIndex;
    }

    // Per-lesson scoring/progress (NEW)
    if (
      lessonData &&
      (lessonData.totalGot !== undefined ||
        lessonData.percentage !== undefined ||
        lessonData.completed !== undefined ||
        lessonData.lessonTitle !== undefined ||
        lessonData.LesoonTitle !== undefined ||
        lessonData.lessonid !== undefined)
    ) {
      upsertLesson(progress, lessonData);
    }

    // Daily progress
    const i = progress.dailyProgress.findIndex(
      (dp) => normalizeToday(dp.date).getTime() === today.getTime()
    );
    if (i === -1) {
      progress.dailyProgress.push({
        date: today,
        timeSpent: timeSpent || 0,
        completed: false,
      });
    } else {
      progress.dailyProgress[i].timeSpent += timeSpent || 0;
    }

    const uniqueDays = new Set(
      progress.dailyProgress.map((dp) => normalizeToday(dp.date).getTime())
    ).size;
    progress.minimumTimeRequirementMet = uniqueDays >= 5;

    // Recompute overall rollups from lessonsProgress
    recomputeRollups(progress);

    await progress.save();
    return await progress.populate(["topic"]);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Mark topic as completed (keeps rollups consistent)
const completeTopic = async (studentId, topicId) => {
  try {
    const progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    });

    if (!progress) throw new Error("Progress record not found");

    if (!progress.minimumTimeRequirementMet) {
      throw new Error("Minimum 5-day requirement not met");
    }

    progress.status = "completed";
    progress.completedAt = new Date();

    // Ensure rollups reflect completion flagging
    recomputeRollups(progress);

    await progress.save();
    return await progress.populate("topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get progress with populated topic (and leave lessons as-is)
const getTopicProgress = async (studentId, topicId) => {
  try {
    const progress = await StudentTopicProgress.findOne({
      student: studentId,
      topic: topicId,
    }).populate("topic");

    if (!progress) {
      const topic = await Topic.findById(topicId);
      // If you need topic content fallback, uncomment code and ensure you have the model:
      // const topicContent = await TopicContent.findOne({ Topic: topicId });

      return {
        student: studentId,
        topic,
        // topicContent, // include if you fetched it
        currentLessonIndex: 0,
        currentSubheadingIndex: 0,
        lessonsProgress: [],
        overallTotalGot: 0,
        overallPercentage: 0,
        status: "not_started",
        startedAt: null,
        completedAt: null,
        lastAccessed: null,
        timeSpent: 0,
        minimumTimeRequirementMet: false,
        dailyProgress: [],
      };
    }

    return progress;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update the "pointer" to which lesson/subheading the student is on
// (no scoring). If you want to also send scores, use updateTopicProgress.
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

    if (progress.status === "not_started") {
      progress.status = "in_progress";
      progress.startedAt = progress.startedAt || new Date();
    }

    // Keep rollups consistent (no changes to lessons here)
    recomputeRollups(progress);

    await progress.save();
    return await progress.populate(["topic"]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllTopicsProgress = async (studentId) => {
  try {
    return await StudentTopicProgress.find({ student: studentId }).populate(
      "topic"
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCompletedTopics = async (studentId) => {
  try {
    return await StudentTopicProgress.find({
      student: studentId,
      status: "completed",
    }).populate("topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

const getInProgressTopics = async (studentId) => {
  try {
    return await StudentTopicProgress.find({
      student: studentId,
      status: "in_progress",
    }).populate("topic");
  } catch (error) {
    throw new Error(error.message);
  }
};

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
    const lastAccessed = new Date(
      progress.lastAccessed || progress.updatedAt || now
    );
    const daysSinceLastAccess = Math.floor(
      (now - lastAccessed) / (1000 * 60 * 60 * 24)
    );

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
