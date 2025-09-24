const Admin = require("../models/admin_model");
const Community = require("../models/community_model");
const Exam = require("../models/exam_model");
const Book = require("../models/library_book_model");
const RecordExam = require("../models/record_exam");
const Student = require("../models/student_model");
const Subject = require("../models/subjects_model");
const TopicContent = require("../models/topic_content_model");
const Topic = require("../models/topic_in_subject");
const Wallet = require("../models/wallet_model");
const StudentTopicProgress = require("../models/student_topic_progress");
const mongoose = require("mongoose");

const getDashboardInfo = async () => {
  try {
    const [
      totalAdmins,
      totalCommunities,
      totalExams,
      totalBooks,
      totalRecordedExams,
      totalStudents,
      totalSubjects,
      totalTopicContents,
      totalTopics,
      totalWallets,
      activeStudents,
      publishedExams,
      visibleBooks,
      visibleSubjects,
      studentsByLevel,
      examsBySubject,
      topicsBySubject,
      booksByLevel, // Changed from communitiesByLevel to booksByLevel
    ] = await Promise.all([
      // Basic counts
      Admin.countDocuments(),
      Community.countDocuments(),
      Exam.countDocuments(),
      Book.countDocuments(),
      RecordExam.countDocuments(),
      Student.countDocuments(),
      Subject.countDocuments(),
      TopicContent.countDocuments(),
      Topic.countDocuments(),
      Wallet.countDocuments(),
      Student.countDocuments({ subscription_status: "active" }),
      Exam.countDocuments({ isPublished: true }),
      Book.countDocuments({ showBook: true }),
      Subject.countDocuments({ showSubject: true }),

      // Data for bar graph 1: Students by education level
      Student.aggregate([
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 },
          },
        },
      ]),

      // Data for bar graph 2: Exams by subject
      Exam.aggregate([
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectData",
          },
        },
        { $unwind: "$subjectData" },
        {
          $group: {
            _id: "$subjectData.subjectName",
            count: { $sum: 1 },
          },
        },
      ]),

      // Data for pie chart 1: Topics by subject
      Topic.aggregate([
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectData",
          },
        },
        { $unwind: "$subjectData" },
        {
          $group: {
            _id: "$subjectData.subjectName",
            count: { $sum: 1 },
          },
        },
      ]),

      // REPLACED: Communities by level with Books by level
      Book.aggregate([
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format data for frontend charts
    const barGraph1 = {
      title: "Students by Education Level",
      labels: studentsByLevel.map((item) => item._id),
      data: studentsByLevel.map((item) => item.count),
    };

    const barGraph2 = {
      title: "Exams by Subject",
      labels: examsBySubject.map((item) => item._id),
      data: examsBySubject.map((item) => item.count),
    };

    const pieChart1 = {
      title: "Topics Distribution by Subject",
      data: topicsBySubject.map((item) => ({
        name: item._id,
        value: item.count,
      })),
    };

    // UPDATED: Changed to Books by Education Level
    const pieChart2 = {
      title: "Library Books by Education Level",
      data: booksByLevel.map((item) => ({
        name: item._id,
        value: item.count,
      })),
    };

    return {
      counts: {
        admins: totalAdmins,
        communities: totalCommunities,
        exams: totalExams,
        books: totalBooks,
        recordedExams: totalRecordedExams,
        students: totalStudents,
        subjects: totalSubjects,
        topicContents: totalTopicContents,
        topics: totalTopics,
        wallets: totalWallets,
      },
      stats: {
        activeStudents,
        publishedExams,
        visibleBooks,
        visibleSubjects,
        activePercentage: totalStudents
          ? Math.round((activeStudents / totalStudents) * 100)
          : 0,
      },
      charts: {
        barGraph1,
        barGraph2,
        pieChart1,
        pieChart2,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
};

const getWalletAnalytics = async () => {
  try {
    // Get all wallets with populated student information
    const wallets = await Wallet.find()
      .populate("student", "firstName lastName email level")
      .lean();

    // Calculate total balance across all wallets
    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + wallet.balance,
      0
    );

    // Calculate total deposits and withdrawals
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;

    // Process transactions
    const transactionStats = {
      byMethod: {
        bank_transfer: { deposits: 0, withdrawals: 0, total: 0 },
        ecocash: { deposits: 0, withdrawals: 0, total: 0 },
        "inn bucks": { deposits: 0, withdrawals: 0, total: 0 },
        other: { deposits: 0, withdrawals: 0, total: 0 },
      },
      byStatus: {
        pending: 0,
        completed: 0,
        failed: 0,
      },
      dailyVolume: {},
    };

    // Process all transactions from all wallets
    wallets.forEach((wallet) => {
      // Process deposits
      wallet.deposits.forEach((deposit) => {
        totalDeposits += deposit.amount;
        depositCount++;

        // Track by method
        if (transactionStats.byMethod[deposit.method]) {
          transactionStats.byMethod[deposit.method].deposits += deposit.amount;
          transactionStats.byMethod[deposit.method].total += deposit.amount;
        }

        // Track by status
        transactionStats.byStatus[deposit.status] =
          (transactionStats.byStatus[deposit.status] || 0) + 1;

        // Track daily volume
        const date = deposit.date.toISOString().split("T")[0];
        transactionStats.dailyVolume[date] =
          (transactionStats.dailyVolume[date] || 0) + deposit.amount;
      });

      // Process withdrawals
      wallet.withdrawals.forEach((withdrawal) => {
        totalWithdrawals += withdrawal.amount;
        withdrawalCount++;

        // Track by method
        if (transactionStats.byMethod[withdrawal.method]) {
          transactionStats.byMethod[withdrawal.method].withdrawals +=
            withdrawal.amount;
          transactionStats.byMethod[withdrawal.method].total +=
            withdrawal.amount;
        }

        // Track by status
        transactionStats.byStatus[withdrawal.status] =
          (transactionStats.byStatus[withdrawal.status] || 0) + 1;

        // Track daily volume
        const date = withdrawal.date.toISOString().split("T")[0];
        transactionStats.dailyVolume[date] =
          (transactionStats.dailyVolume[date] || 0) - withdrawal.amount;
      });
    });

    // Get top 10 students by balance
    const topStudentsByBalance = [...wallets]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10)
      .map((wallet) => ({
        student: wallet.student,
        balance: wallet.balance,
        currency: wallet.currency,
      }));

    // Get top 10 students by deposits
    const studentDeposits = wallets.map((wallet) => {
      const totalDeposit = wallet.deposits.reduce((sum, deposit) => {
        return deposit.status === "completed" ? sum + deposit.amount : sum;
      }, 0);

      return {
        student: wallet.student,
        totalDeposit,
      };
    });

    const topStudentsByDeposits = studentDeposits
      .sort((a, b) => b.totalDeposit - a.totalDeposit)
      .slice(0, 10);

    // Get top 10 students by withdrawals
    const studentWithdrawals = wallets.map((wallet) => {
      const totalWithdrawal = wallet.withdrawals.reduce((sum, withdrawal) => {
        return withdrawal.status === "completed"
          ? sum + withdrawal.amount
          : sum;
      }, 0);

      return {
        student: wallet.student,
        totalWithdrawal,
      };
    });

    const topStudentsByWithdrawals = studentWithdrawals
      .sort((a, b) => b.totalWithdrawal - a.totalWithdrawal)
      .slice(0, 10);

    // Calculate net flow (deposits - withdrawals)
    const netFlow = totalDeposits - totalWithdrawals;

    // Prepare data for charts
    const transactionMethodChart = {
      title: "Transactions by Method",
      data: Object.entries(transactionStats.byMethod).map(
        ([method, stats]) => ({
          name: method,
          deposits: stats.deposits,
          withdrawals: stats.withdrawals,
          total: stats.total,
        })
      ),
    };

    const transactionStatusChart = {
      title: "Transactions by Status",
      data: Object.entries(transactionStats.byStatus).map(
        ([status, count]) => ({
          name: status,
          value: count,
        })
      ),
    };

    const dailyVolumeChart = {
      title: "Daily Transaction Volume",
      labels: Object.keys(transactionStats.dailyVolume),
      data: Object.values(transactionStats.dailyVolume),
    };

    return {
      summary: {
        totalWallets: wallets.length,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        netFlow,
        depositCount,
        withdrawalCount,
        averageDeposit: depositCount > 0 ? totalDeposits / depositCount : 0,
        averageWithdrawal:
          withdrawalCount > 0 ? totalWithdrawals / withdrawalCount : 0,
      },
      transactionStats,
      topStudents: {
        byBalance: topStudentsByBalance,
        byDeposits: topStudentsByDeposits,
        byWithdrawals: topStudentsByWithdrawals,
      },
      charts: {
        transactionMethodChart,
        transactionStatusChart,
        dailyVolumeChart,
      },
      allWallets: wallets, // Return all wallet data as requested
    };
  } catch (error) {
    throw new Error(`Failed to fetch wallet analytics: ${error.message}`);
  }
};

const getStudentInfoOnLevel = async (level, studentId) => {
  try {
    // Verify student exists and matches the level
    const student = await Student.findOne({
      _id: studentId,
      level: level,
    });

    if (!student) {
      throw new Error("Student not found or level mismatch");
    }

    // Get 6 random subjects for the specified level
    const randomSubjects = await Subject.aggregate([
      { $match: { Level: level, showSubject: true } },
      { $sample: { size: 6 } },
      { $project: { subjectName: 1, imageUrl: 1, Level: 1 } },
    ]);

    // Get 8 random communities for the specified level
    const randomCommunities = await Community.aggregate([
      { $match: { Level: level, showCommunity: true } },
      { $sample: { size: 8 } },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectData",
        },
      },
      { $unwind: "$subjectData" },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          Level: 1,
          subjectName: "$subjectData.subjectName",
          studentsCount: { $size: "$students" },
        },
      },
    ]);

    // Get 8 random books for the specified level with title, cover_image, file_path, likes
    // Get 8 random books for the specified level with title, cover_image, file_path, likes
    const randomBooks = await Book.aggregate([
      { $match: { level: level } }, // 🔥 removed showBook
      { $sample: { size: 8 } },
      {
        $project: {
          title: 1,
          cover_image: 1,
          file_path: 1,
          likesCount: 1,
          level: 1,
        },
      },
    ]);

    return {
      studentInfo: {
        id: student._id,
        name: student.name,
        level: student.level,
      },
      recommendedSubjects: randomSubjects,
      recommendedCommunities: randomCommunities,
      recommendedBooks: randomBooks,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch student level information: ${error.message}`
    );
  }
};

// Add this function to your dashboard_services.js file
// Add this function to your dashboard_services.js file
const getStudentActivities = async (studentId) => {
  try {
    // Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error("Invalid student ID");
    }

    const [
      studentInfo,
      examRecords,
      topicProgress,
      walletInfo,
      communities,
      totalExamsTaken,
      totalTopicsStarted,
      totalTopicsCompleted,
      totalCommunitiesJoined,
      walletTransactions,
    ] = await Promise.all([
      // Get basic student information
      Student.findById(studentId)
        .select("-password -resetPasswordVerificationSid -resetPasswordExpires")
        .populate("progress"),

      // Get exam records with exam details
      RecordExam.find({ studentId })
        .populate("ExamId", "title subject duration")
        .sort({ createdAt: -1 })
        .limit(10),

      // Get topic progress with topic details
      StudentTopicProgress.find({ student: studentId })
        .populate("topic", "title subject")
        .sort({ lastAccessed: -1 }),

      // Get wallet information
      Wallet.findOne({ student: studentId }).select(
        "balance currency deposits withdrawals"
      ),

      // Get communities the student is part of
      Community.find({ students: studentId })
        .populate("subject", "subjectName")
        .select("name subject Level"),

      // Count total exams taken
      RecordExam.countDocuments({ studentId }),

      // Count topics started (in progress or completed)
      StudentTopicProgress.countDocuments({
        student: studentId,
        status: { $in: ["in_progress", "completed"] },
      }),

      // Count topics completed
      StudentTopicProgress.countDocuments({
        student: studentId,
        status: "completed",
      }),

      // Count communities joined
      Community.countDocuments({ students: studentId }),

      // Get all wallet transactions (both deposits and withdrawals)
      Wallet.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(studentId) } },
        { $unwind: { path: "$deposits", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$withdrawals", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            transactions: {
              $concatArrays: [
                {
                  $cond: [
                    { $eq: [{ $ifNull: ["$deposits", []] }, []] },
                    [],
                    [
                      {
                        type: "deposit",
                        amount: "$deposits.amount",
                        method: "$deposits.method",
                        status: "$deposits.status",
                        date: "$deposits.date",
                        reference: "$deposits.reference",
                      },
                    ],
                  ],
                },
                {
                  $cond: [
                    { $eq: [{ $ifNull: ["$withdrawals", []] }, []] },
                    [],
                    [
                      {
                        type: "withdrawal",
                        amount: "$withdrawals.amount",
                        method: "$withdrawals.method",
                        status: "$withdrawals.status",
                        date: "$withdrawals.date",
                        reference: "$withdrawals.reference",
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
        { $unwind: "$transactions" },
        { $replaceRoot: { newRoot: "$transactions" } },
        { $sort: { date: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // If student not found
    if (!studentInfo) {
      throw new Error("Student not found");
    }

    // Prepare data for charts
    // 1. Performance by subject (exam scores)
    const performanceBySubject = await RecordExam.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "exams",
          localField: "ExamId",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      {
        $lookup: {
          from: "subjects",
          localField: "exam.subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: "$subject.subjectName",
          averageScore: {
            $avg: {
              $toDouble: {
                $replaceAll: {
                  input: { $toString: "$percentange" }, // convert everything to string first
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          examCount: { $sum: 1 },
        },
      },
    ]);

    // 2. Progress by subject (topics)
    const progressBySubject = await StudentTopicProgress.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topic",
        },
      },
      { $unwind: "$topic" },
      {
        $lookup: {
          from: "subjects",
          localField: "topic.subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: "$subject.subjectName",
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    // 3. Time spent by subject
    const timeSpentBySubject = await StudentTopicProgress.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topic",
        },
      },
      { $unwind: "$topic" },
      {
        $lookup: {
          from: "subjects",
          localField: "topic.subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: "$subject.subjectName",
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
    ]);

    // Format data for charts
    const performanceChart = {
      title: "Performance by Subject",
      labels: performanceBySubject.map((item) => item._id),
      data: performanceBySubject.map((item) => item.averageScore),
    };

    const progressChart = {
      title: "Progress by Subject",
      labels: progressBySubject.map((item) => item._id),
      datasets: [
        {
          label: "Completed",
          data: progressBySubject.map((item) => item.completed),
        },
        {
          label: "In Progress",
          data: progressBySubject.map((item) => item.inProgress),
        },
      ],
    };

    const timeSpentChart = {
      title: "Time Spent by Subject (minutes)",
      labels: timeSpentBySubject.map((item) => item._id),
      data: timeSpentBySubject.map((item) => item.totalTimeSpent),
    };

    return {
      studentInfo,
      activities: {
        examRecords,
        topicProgress,
        walletInfo,
        communities,
        walletTransactions,
      },
      summary: {
        totalExamsTaken,
        totalTopicsStarted,
        totalTopicsCompleted,
        totalCommunitiesJoined,
        completionRate:
          totalTopicsStarted > 0
            ? Math.round((totalTopicsCompleted / totalTopicsStarted) * 100)
            : 0,
      },
      charts: {
        performanceChart,
        progressChart,
        timeSpentChart,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch student activities: ${error.message}`);
  }
};

//get student activities in the whole system

module.exports = {
  getDashboardInfo,
  getWalletAnalytics,
  getStudentInfoOnLevel,
  getStudentActivities,
};
