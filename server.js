const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load .env variables
const adminRouter = require("./routers/admin_router.js");
const studentRouter = require("./routers/student_router.js");
const contentSystemRouter = require("./routers/content_system_router");
const commentContentSystemRouter = require("./routers/comment_content_router.js");
const subjectRouter = require("./routers/subject_router.js");
const topicRouter = require("./routers/topic_in_subject.js");
const topicContentRouter = require("./routers/topic_content_router.js");
const comment_topic_content_route = require("./routers/comment_topic_content_router.js");
const community_route = require("./routers/community_router.js");
const message_community_route = require("./routers/message_community_router.js");
const walletRouter = require("./routers/wallet_router.js");
const examRouter = require("./routers/exam_router.js");
const libraryBookRouter = require("./routers/library_book_router.js");
const paymentRouter = require("./routers/payment_router.js");
const recordExam = require("./routers/record_exam_router.js");
const dashboard = require("./routers/dashboard_router.js");

const dbUrl = process.env.DATABASE_URL;
const Port = process.env.PORT || 3000;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Error connecting to the database:", err));

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/api/v1/admin_route", adminRouter);
app.use("/api/v1/student_route", studentRouter);
app.use("/api/v1/content_system", contentSystemRouter);
app.use("/api/v1/comment_content_system", commentContentSystemRouter);
app.use("/api/v1/subject", subjectRouter);
app.use("/api/v1/topic_in_subject",topicRouter );
app.use("/api/v1/topic_content",topicContentRouter );
app.use("/api/v1/comment_topic_content",comment_topic_content_route );
app.use("/api/v1/community_service",community_route );
app.use("/api/v1/message_community_route",message_community_route );
app.use("/api/wallet", walletRouter);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/library_book", libraryBookRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/record_exam", recordExam);
app.use("/api/v1/dashboards", dashboard);


app.listen(Port, () => {
    console.log("The server is running at port:", Port);
  });
  