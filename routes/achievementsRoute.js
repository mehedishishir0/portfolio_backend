const {
  getAchievements,
  postAchievements,
  updateAchievments,
  deleteAcievments,
} = require("../controllers/achievementsControllers");
const uplode = require("../uploder/imageUploder");
const achievmentsRoute = require("express").Router();
const { protected } = require("../middlewares/authMiddilewares");
achievmentsRoute.get("/", getAchievements);
achievmentsRoute.post("/", protected, uplode.single("image"), postAchievements);
achievmentsRoute.put(
  "/:id",
  protected,
  uplode.single("image"),
  updateAchievments
);
achievmentsRoute.delete("/:id", protected, deleteAcievments);

module.exports = achievmentsRoute;
