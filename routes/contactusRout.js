const { postContactus } = require("../controllers/contactusControllers");

const contactUsRoute = require("express").Router();

contactUsRoute.post("/", postContactus);

module.exports = contactUsRoute;
