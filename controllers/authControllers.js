const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const AuthModel = require("../model/authModel");
const { successResponse } = require("../response/response");
const { createToken } = require("../helper/jwt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const authenticator = otplib.authenticator || {
  generateSecret: () => otplib.generateSecret(),
  keyuri: (email, issuer, secret) =>
    otplib.generateURI ? otplib.generateURI({ secret, issuer, label: email }) : `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`,
  verify: ({ token, secret }) => {
    if (otplib.verifySync) {
      const res = otplib.verifySync({ token, secret });
      return typeof res === "boolean" ? res : res?.valid === true;
    }
    return otplib.authenticator ? otplib.authenticator.verify({ token, secret }) : false;
  },
};
const qrcode = require("qrcode");
const { sendEmailByresetPassword } = require("../config/mail");
const {
  encryptSecret,
  decryptSecret,
  generateRecoveryCode,
  hashRecoveryCode,
} = require("../helper/cryptoHelper");

exports.registereUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createError(404, "all filad are required");
    }
    const existingUser = await AuthModel.findOne({ email });

    if (existingUser) {
      throw createError(409, "email alrady exist");
    }
    const hash = await bcryptjs.hash(password, 10);
    const response = await AuthModel.create({
      name,
      email,
      password: hash,
    });

    const userObj = response.toObject();
    delete userObj.password;
    delete userObj.twoFactorSecret;
    delete userObj.twoFactorRecoveryCodes;

    successResponse(res, {
      statusCode: 201,
      message: "user registerd successfully",
      data: userObj,
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

    // If 2FA is enabled for this user, issue a temporary authentication token
    if (findUser.twoFactorEnabled) {
      const tempToken = createToken(
        { userId: findUser._id, is2FA: true },
        process.env.JWT_SECRET,
        "5m"
      );

      return successResponse(res, {
        statusCode: 200,
        message: "2FA authentication required",
        data: {
          require2FA: true,
          tempToken: tempToken,
        },
      });
    }

    const token = createToken(
      { userId: findUser._id, role: findUser.role },
      process.env.JWT_SECRET,
      "30days"
    );
    const userData = findUser.toObject();
    delete userData.password;
    delete userData.twoFactorSecret;
    delete userData.twoFactorRecoveryCodes;

    successResponse(res, {
      statusCode: 200,
      message: "Login successfully",
      data: { data: userData, accessToken: token },
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

    // generate reset key
    const restToken = crypto.randomBytes(32).toString("hex");
    const hasedToken = crypto
      .createHash("sha256")
      .update(restToken)
      .digest("hex");
    // save to user
    user.resetPasswordToken = hasedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15mn
    await user.save();

    const resteUrl = `${process.env.CLIENT_URL}/reset-password?${restToken}`;

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

// ==================== 2FA CONTROLLERS ====================

/**
 * Setup 2FA: Generates a secret, QR code, and backup codes
 */
exports.setup2FA = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const user = await AuthModel.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Generate fresh secret
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, "Portfolio Admin", secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    // Generate 8 recovery codes
    const recoveryCodesPlain = [];
    const recoveryCodesHashed = [];

    for (let i = 0; i < 8; i++) {
      const code = generateRecoveryCode();
      recoveryCodesPlain.push(code);
      recoveryCodesHashed.push({
        code: hashRecoveryCode(code),
        used: false,
      });
    }

    // Save encrypted secret & hashed recovery codes (twoFactorEnabled remains false until verified)
    user.twoFactorSecret = encryptSecret(secret);
    user.twoFactorRecoveryCodes = recoveryCodesHashed;
    await user.save();

    successResponse(res, {
      statusCode: 200,
      message: "2FA setup generated successfully",
      data: {
        qrCode: qrCodeUrl,
        secret: secret, // plain text for manual typing into authenticator
        recoveryCodes: recoveryCodesPlain,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA Setup: Verifies initial TOTP code to activate 2FA
 */
exports.verify2FASetup = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    if (!code) {
      throw createError(400, "Verification code is required");
    }

    const user = await AuthModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw createError(400, "2FA setup has not been initiated");
    }

    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    if (!decryptedSecret) {
      throw createError(500, "Failed to process 2FA secret");
    }

    // Configure window tolerance (allow 1 step difference for minor clock drift)
    authenticator.options = { window: 1 };
    const isValid = authenticator.verify({ token: code.trim(), secret: decryptedSecret });

    if (!isValid) {
      if (req.otpRateLimit) req.otpRateLimit.increment();
      throw createError(400, "Invalid 6-digit authenticator code");
    }

    user.twoFactorEnabled = true;
    await user.save();

    if (req.otpRateLimit) req.otpRateLimit.reset();

    successResponse(res, {
      statusCode: 200,
      message: "Two-Factor Authentication enabled successfully",
      data: { twoFactorEnabled: true },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA Login: Verifies TOTP or Recovery Code using temporary token and issues final access token
 */
exports.verify2FALogin = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      throw createError(400, "Temporary token and verification code are required");
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      throw createError(401, "Invalid or expired temporary session. Please log in again.");
    }

    if (!decoded || !decoded.is2FA || !decoded.userId) {
      throw createError(401, "Invalid 2FA session");
    }

    const user = await AuthModel.findById(decoded.userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw createError(400, "Two-factor authentication is not configured for this user");
    }

    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    const trimmedCode = code.trim();

    authenticator.options = { window: 1 };
    let isValid = authenticator.verify({ token: trimmedCode, secret: decryptedSecret });
    let usedRecoveryCode = false;

    // If TOTP fails, check recovery codes
    if (!isValid && user.twoFactorRecoveryCodes && user.twoFactorRecoveryCodes.length > 0) {
      const hashedInputCode = hashRecoveryCode(trimmedCode);
      const matchIndex = user.twoFactorRecoveryCodes.findIndex(
        (item) => item.code === hashedInputCode && !item.used
      );

      if (matchIndex !== -1) {
        isValid = true;
        usedRecoveryCode = true;
        user.twoFactorRecoveryCodes[matchIndex].used = true;
        await user.save();
      }
    }

    if (!isValid) {
      if (req.otpRateLimit) req.otpRateLimit.increment();
      throw createError(401, "Invalid authenticator code or recovery code");
    }

    if (req.otpRateLimit) req.otpRateLimit.reset();

    // Generate final access token
    const token = createToken(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      "30days"
    );

    const userData = user.toObject();
    delete userData.password;
    delete userData.twoFactorSecret;
    delete userData.twoFactorRecoveryCodes;

    successResponse(res, {
      statusCode: 200,
      message: usedRecoveryCode
        ? "Login successfully using recovery code"
        : "Login successfully",
      data: { data: userData, accessToken: token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA: Requires password & current 6-digit TOTP code
 */
exports.disable2FA = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { password, code } = req.body;

    if (!password || !code) {
      throw createError(400, "Password and authenticator code are required");
    }

    const user = await AuthModel.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (!user.twoFactorEnabled) {
      throw createError(400, "Two-factor authentication is already disabled");
    }

    // Verify password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw createError(401, "Password is incorrect");
    }

    // Verify TOTP code or recovery code
    const decryptedSecret = decryptSecret(user.twoFactorSecret);
    const trimmedCode = code.trim();
    authenticator.options = { window: 1 };
    let isValid = authenticator.verify({ token: trimmedCode, secret: decryptedSecret });

    if (!isValid && user.twoFactorRecoveryCodes) {
      const hashedInputCode = hashRecoveryCode(trimmedCode);
      const matchIndex = user.twoFactorRecoveryCodes.findIndex(
        (item) => item.code === hashedInputCode && !item.used
      );
      if (matchIndex !== -1) {
        isValid = true;
        user.twoFactorRecoveryCodes[matchIndex].used = true;
      }
    }

    if (!isValid) {
      if (req.otpRateLimit) req.otpRateLimit.increment();
      throw createError(400, "Invalid authenticator code or recovery code");
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorRecoveryCodes = [];
    await user.save();

    if (req.otpRateLimit) req.otpRateLimit.reset();

    successResponse(res, {
      statusCode: 200,
      message: "Two-factor authentication disabled successfully",
      data: { twoFactorEnabled: false },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get 2FA Status
 */
exports.get2FAStatus = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const user = await AuthModel.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    successResponse(res, {
      statusCode: 200,
      message: "2FA status retrieved",
      data: {
        twoFactorEnabled: user.twoFactorEnabled || false,
      },
    });
  } catch (error) {
    next(error);
  }
};
