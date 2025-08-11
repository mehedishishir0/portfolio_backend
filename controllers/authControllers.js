const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const AuthModel = require("../model/authModel");
const { successResponse } = require("../response/response");
const { createToken } = require("../helper/jwt");

exports.registereUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(404, "all filad are required");
    }
    const existingUser = await AuthModel.findOne({ email });
    console.log(existingUser)

    if (existingUser) {
      throw createError(409, "email alrady exist");
    }
    const hash = await bcryptjs.hash(password, 10);
    const response = await AuthModel.create({
      name,
      email,
      password: hash,
    });
    successResponse(res, {
      statusCode: 201,
      message: "user registerd successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError(404, "all faild are required");
    }
    const findUser = await AuthModel.findOne({ email });
    if (!findUser) {
      throw createError(404, "somthing want wrong");
    }
    const isMatch = await bcryptjs.compare(password, findUser.password);
    if (!isMatch) {
      throw createError(401, "Email or Password are incorrect ");
    }
    const userId = findUser._id;
    const token = createToken({ userId }, process.env.JWT_SECRET, "30days");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000, // Set cookie to expire in 30 days (in milliseconds)
    });
    successResponse(res, { statusCode: 200, message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};
