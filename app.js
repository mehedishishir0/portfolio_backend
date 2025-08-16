const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const { errorResponse } = require("./response/response");
const heroRoute = require("./routes/heroRout");
const aboutRoute = require("./routes/aboutRoute");
const technologiRoute = require("./routes/technologiesLoveRout");
const projectRoute = require("./routes/projectRoute");
const achievmentsRoute = require("./routes/achievementsRoute");
const timelineRoute = require("./routes/timelineRoute");
const stackGaleryRoute = require("./routes/stackGalleryRoute");
const contactUsRoute = require("./routes/contactusRout");
const authRoute = require("./routes/authRoute");
const app = express();
const cookieParser = require("cookie-parser");
const testomonialRoute = require("./routes/testomonialRoute");

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
  credentials: true,
}));
app.use(cookieParser());

app.use("/api/v1/hero", heroRoute);
app.use("/api/v1/about", aboutRoute);
app.use("/api/v1/technology", technologiRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/achievment", achievmentsRoute);
app.use("/api/v1/timeline", timelineRoute);
app.use("/api/v1/stackgalery", stackGaleryRoute);
app.use("/api/v1/contactus", contactUsRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/testomonial", testomonialRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  next(createError(404, "route not exist"));
});

app.use((error, req, res, next) => {
  errorResponse(res, {
    statusCode: error.statusCode,
    message: error.message,
  });
});

module.exports = app;
