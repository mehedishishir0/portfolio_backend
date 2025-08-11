const { getAchievements, postAchievements, updateAchievments, deleteAcievments } = require("../controllers/achievementsControllers")
const uplode = require("../uploder/imageUploder")
const achievmentsRoute = require("express").Router()

achievmentsRoute.get("/", getAchievements)
achievmentsRoute.post("/", uplode.single("image"), postAchievements)
achievmentsRoute.put("/:id", uplode.single("image"), updateAchievments)
achievmentsRoute.delete("/:id", deleteAcievments)


module.exports = achievmentsRoute