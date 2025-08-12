const {
  getTechnologi,
  postTechnologi,
  updateTechnologi,
  deleteTechnologi,
} = require("../controllers/technologiesLoveControllers");
const upload = require("../uploder/imageUploder");
const { protected } = require("../middlewares/authMiddilewares");
const technologiRoute = require("express").Router();

technologiRoute.get("/", getTechnologi);
technologiRoute.post("/",protected, upload.single("image"), postTechnologi);
technologiRoute.put("/:id",protected, upload.single("image"), updateTechnologi);
technologiRoute.delete("/:id",protected, deleteTechnologi);

module.exports = technologiRoute;
