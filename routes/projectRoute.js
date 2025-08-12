const {
  getProject,
  postProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectControllers");
const upload = require("../uploder/imageUploder");
const { protected } = require("../middlewares/authMiddilewares");
const projectRoute = require("express").Router();

projectRoute.get("/", getProject);
projectRoute.post("/",protected, upload.array("images"), postProject);
projectRoute.put("/:id",protected, upload.array("images"), updateProject);
projectRoute.delete("/:id",protected, deleteProject);

module.exports = projectRoute;
