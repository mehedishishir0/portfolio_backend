const {
  getAbout,
  postAbout,
  updateAbout,
} = require("../controllers/aboutControlers");
const upload = require("../uploder/imageUploder");

const aboutRoute = require("express").Router();

aboutRoute.get("/", getAbout);
aboutRoute.post("/", upload.single("image"), postAbout);
aboutRoute.put("/", upload.single("image"), updateAbout);

module.exports = aboutRoute;
