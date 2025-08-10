const { getHero, postHero, updateHero } = require("../controllers/heroControlers");

const heroRoute = require("express").Router();

heroRoute.get("/", getHero);
heroRoute.post("/",postHero)
heroRoute.put("/",updateHero)


module.exports = heroRoute;
