const {
  registereUser,
  loginUser,
  resetPassword,
  forgotPassword,
  setup2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  get2FAStatus,
} = require("../controllers/authControllers");

const { protected } = require("../middlewares/authMiddilewares");
const { otpRateLimiter } = require("../middlewares/rateLimiter");

const authRoute = require("express").Router();

authRoute.post("/register", registereUser);
authRoute.post("/login", loginUser);
authRoute.post("/forgot-password", forgotPassword);
authRoute.post("/reset-password", resetPassword);

// 2FA Routes
authRoute.get("/2fa/status", protected, get2FAStatus);
authRoute.post("/2fa/setup", protected, setup2FA);
authRoute.post("/2fa/verify-setup", protected, otpRateLimiter, verify2FASetup);
authRoute.post("/2fa/verify", otpRateLimiter, verify2FALogin);
authRoute.post("/2fa/disable", protected, otpRateLimiter, disable2FA);

module.exports = authRoute;
