const {
  getStackGallery,
  deleteStackGallery,
  updateStackGallery,
  postStackGallery,
} = require("../controllers/stackGalleryControllers");
const { protected } = require("../middlewares/authMiddilewares");
const upload = require("../uploder/imageUploder");
const stackGaleryRoute = require("express").Router();
stackGaleryRoute.get("/", getStackGallery);
stackGaleryRoute.post("/", protected, upload.single("image"), postStackGallery);
stackGaleryRoute.put(
  "/:id",
  protected,
  upload.single("image"),
  updateStackGallery
);
stackGaleryRoute.delete("/:id", protected, deleteStackGallery);

module.exports = stackGaleryRoute;
