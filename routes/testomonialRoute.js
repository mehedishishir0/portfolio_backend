const {
  getTestomonials,
  updateTestomonial,
  deleteTestomonial,
  postTestimonial,
} = require("../controllers/testomonialController");
const upload = require("../uploder/imageUploder");
const testomonialRoute = require("express").Router();
const { protected } = require("../middlewares/authMiddilewares");
testomonialRoute.get("/", getTestomonials);
testomonialRoute.post("/", upload.single("image"), postTestimonial);
testomonialRoute.put(
  "/:id",
  protected,
  upload.single("image"),
  updateTestomonial
);
testomonialRoute.delete("/:id", protected, deleteTestomonial);

module.exports = testomonialRoute;
