const jwt = require("jsonwebtoken");
const createError = require("http-errors");

exports.protected = async (req, res, next) => {
  try {
    console.log(req.cookies)
    let token = req.cookies?.next - auth.session - token;

    if (!token) {
      throw createError(401, "Not authinticated");
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    if (decoded.role !== "admin") {
      throw createError(403, "access denied. you are not a admin");
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token expired"));
    }
    next(error);
  }
};
