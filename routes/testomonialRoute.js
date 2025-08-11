const { getTestomonials, postTestomonial, updateTestomonial, deleteTestomonial } = require('../controllers/testomonialController');
const upload = require("../uploder/imageUploder")
const testomonialRoute = require('express').Router();

testomonialRoute.get("/", getTestomonials)
testomonialRoute.post("/", upload.single("image"), postTestomonial)
testomonialRoute.put("/:id", upload.single("image"), updateTestomonial)
testomonialRoute.delete("/:id", deleteTestomonial)