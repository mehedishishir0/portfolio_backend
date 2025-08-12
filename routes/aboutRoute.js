const {
  getAbout,
  postAbout,
  updateAbout,
} = require("../controllers/aboutControlers");
const upload = require("../uploder/imageUploder");
const { protected } = require("../middlewares/authMiddilewares");
const aboutRoute = require("express").Router();

aboutRoute.get("/", getAbout);
aboutRoute.post("/", protected, upload.single("image"), postAbout);
aboutRoute.put("/", protected, upload.single("image"), updateAbout);

module.exports = aboutRoute;
