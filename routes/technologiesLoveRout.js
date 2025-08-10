const {
  getTechnologi,
  postTechnologi,
  updateTechnologi,
  deleteTechnologi,
} = require("../controllers/technologiesLoveControllers");
const upload = require("../uploder/imageUploder");

const technologiRoute = require("express").Router();

technologiRoute.get("/", getTechnologi);
technologiRoute.post("/", upload.single("image"), postTechnologi);
technologiRoute.put("/:id", upload.single("image"), updateTechnologi);
technologiRoute.delete("/:id", deleteTechnologi);

module.exports = technologiRoute;
