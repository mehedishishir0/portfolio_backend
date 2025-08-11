const {
  getTimelin,
  postTimeline,
  updateTimeline,
  deleteTimeline,
} = require("../controllers/timelineControllers");

const timelineRoute = require("express").Router();

timelineRoute.get("/", getTimelin);
timelineRoute.post("/", postTimeline);
timelineRoute.put("/:id", updateTimeline);
timelineRoute.delete("/:id", deleteTimeline);

module.exports = timelineRoute;
