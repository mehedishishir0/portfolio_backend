const {
  getProject,
  postProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectControllers");
const upload = require("../uploder/imageUploder");

const projectRoute = require("express").Router();

projectRoute.get("/", getProject);
projectRoute.post("/", upload.array("images"), postProject);
projectRoute.put("/:id", upload.array("images"), updateProject);
projectRoute.delete("/:id", deleteProject);

module.exports = projectRoute;
