const express = require("express");
app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

app.use(cors({ credentials: true, origin: process.env.APP_URL }));
app.use(cookieParser());
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected to db");
  }
);

//Routes
const userRouter = require("./routes/User");
app.use("/users", userRouter);

const adminRouter = require("./routes/Admin");
app.use("/admin", adminRouter);

const publicRouter = require("./routes/Public");
app.use("/public", publicRouter);

//Static folder for profile pics etc
app.use("/images", express.static(__dirname + "/images"));

//set up static folder for rendering react app
//app.use(express.static(path.join(__dirname, "frontend/build")));

//Handle any requests that doesn't target root url
/*app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
});*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server started on", PORT);
});
