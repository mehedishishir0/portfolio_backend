const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const AuthModel = require("../model/authModel");
const { successResponse } = require("../response/response");
const { createToken } = require("../helper/jwt");
const crypto = require("crypto");
const { sendEmailByresetPassword } = require("../config/mail");

exports.registereUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(404, "all filad are required");
    }
    const existingUser = await AuthModel.findOne({ email });
    console.log(existingUser);

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
    const token = createToken(
      { userId: findUser._id, role: findUser.role },
      process.env.JWT_SECRET,
      "30days"
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    successResponse(res, {
      statusCode: 200,
      message: "Login successfully",
      data: findUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createError(400, "email are required");
    }
    const user = await AuthModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    //  generate reset jey
    const restToken = crypto.randomBytes(32).toString("hex");
    const hasedToken = crypto
      .createHash("sha256")
      .update(restToken)
      .digest("hex");

    //save to user
    user.resetPasswordToken = hasedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15mn
    await user.save();
    console.log(process.env.CLIENT_URL);
    const resteUrl = `${process.env.CLIENT_URL}/reset-password?${restToken}`;

    // sendmail

    await sendEmailByresetPassword({
      to: user.email,
      subject: "Password Reset Request",
      resetUrl: resteUrl,
    });
    successResponse(res, {
      statusCode: 200,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      throw createError(404, "token and password are required");
    }
    const hasedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await AuthModel.findOne({
      resetPasswordToken: hasedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      throw createError(400, "Invalid or expired token");
    }

    const hasedPassword = await bcryptjs.hash(password, 10);
    user.password = hasedPassword;

    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    successResponse(res, {
      statusCode: 200,
      message: "Password reset successfylly",
    });
  } catch (error) {
    next(error);
  }
};
