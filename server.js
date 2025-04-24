const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load .env variables
const adminRouter = require("./routers/admin_router.js");
const studentRouter = require("./routers/student_router.js");
const contentSystemRouter = require("./routers/content_system_router");
const commentContentSystemRouter = require("./routers/comment_content_router.js");

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

app.listen(Port, () => {
    console.log("The server is running at port:", Port);
  });
  