const {
  getTestomonials,
  postTestomonial,
  updateTestomonial,
  deleteTestomonial,
} = require("../controllers/testomonialController");
const upload = require("../uploder/imageUploder");
const testomonialRoute = require("express").Router();
const { protected } = require("../middlewares/authMiddilewares");
testomonialRoute.get("/", getTestomonials);
testomonialRoute.post("/", protected, upload.single("image"), postTestomonial);
testomonialRoute.put(
  "/:id",
  protected,
  upload.single("image"),
  updateTestomonial
);
testomonialRoute.delete("/:id", protected, deleteTestomonial);
