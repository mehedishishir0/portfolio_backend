const {
  getStackGallery,
  deleteStackGallery,
  updateStackGallery,
  postStackGallery,
} = require("../controllers/stackGalleryControllers");
const { protected } = require("../middlewares/authMiddilewares");
const stackGaleryRoute = require("express").Router();

stackGaleryRoute.get("/", getStackGallery);
stackGaleryRoute.post("/",protected, postStackGallery);
stackGaleryRoute.put("/:id",protected, updateStackGallery);
stackGaleryRoute.delete("/:id",protected, deleteStackGallery);

module.exports = stackGaleryRoute;
