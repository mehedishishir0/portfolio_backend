const {
  getStackGallery,
  deleteStackGallery,
  updateStackGallery,
  postStackGallery,
} = require("../controllers/stackGalleryControllers");
const { protected } = require("../middlewares/authMiddilewares");
const stackGaleryRoute = require("express").Router();
const upload = require("../uploder/imageUploder");
stackGaleryRoute.get("/", getStackGallery);
stackGaleryRoute.post("/", protected, upload.single("image"), postStackGallery);
stackGaleryRoute.put("/:id", protected, upload.single("image"), updateStackGallery);
stackGaleryRoute.delete("/:id", protected, upload.single("image"), deleteStackGallery);

module.exports = stackGaleryRoute;
