const {
  getProject,
  postProject,
  updateProject,
  deleteProject,
  getSingelProject,
} = require("../controllers/projectControllers");
const upload = require("../uploder/imageUploder");
const { protected } = require("../middlewares/authMiddilewares");
const projectRoute = require("express").Router();

projectRoute.get("/", getProject);
projectRoute.get("/:id", getSingelProject);
projectRoute.post("/",protected, upload.array("images"), postProject);
projectRoute.put("/:id",protected, upload.array("images"), updateProject);
projectRoute.delete("/:id",protected, deleteProject);

module.exports = projectRoute;
