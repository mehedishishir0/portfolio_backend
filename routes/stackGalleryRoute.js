const {
  getStackGallery,
  deleteStackGallery,
  updateStackGallery,
  postStackGallery,
} = require("../controllers/stackGalleryControllers");

const stackGaleryRoute = require("express").Router();

stackGaleryRoute.get("/", getStackGallery);
stackGaleryRoute.post("/", postStackGallery);
stackGaleryRoute.put("/:id", updateStackGallery);
stackGaleryRoute.delete("/:id", deleteStackGallery);

module.exports = stackGaleryRoute;
