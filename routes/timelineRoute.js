const {
  getTimelin,
  postTimeline,
  updateTimeline,
  deleteTimeline,
} = require("../controllers/timelineControllers");
const { protected } = require("../middlewares/authMiddilewares");
const timelineRoute = require("express").Router();

timelineRoute.get("/", getTimelin);
timelineRoute.post("/", protected, postTimeline);
timelineRoute.put("/:id", protected, updateTimeline);
timelineRoute.delete("/:id", protected, deleteTimeline);

module.exports = timelineRoute;
