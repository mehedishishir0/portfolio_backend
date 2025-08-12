const { registereUser, loginUser, resetPassword, forgotPassword } = require("../controllers/authControllers")

const authRoute = require("express").Router()

authRoute.post("/register",registereUser)
authRoute.post("/login",loginUser)
authRoute.post("/forgot-password",forgotPassword)
authRoute.post("/reset-password",resetPassword)
module.exports = authRoute