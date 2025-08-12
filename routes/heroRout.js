const { getHero, postHero, updateHero } = require("../controllers/heroControlers");

const heroRoute = require("express").Router();
const { protected } = require("../middlewares/authMiddilewares");

heroRoute.get("/", getHero);
heroRoute.post("/",protected,postHero)
heroRoute.put("/",protected,updateHero)


module.exports = heroRoute;
