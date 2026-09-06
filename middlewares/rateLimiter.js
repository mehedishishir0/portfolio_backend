const createError = require("http-errors");

// In-memory rate limiting map: key -> { attempts: number, resetTime: number }
const attemptsMap = new Map();

/**
 * Middleware to rate-limit OTP verification attempts.
 * Allows max 5 attempts per 5 minutes.
 */
exports.otpRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
  const key = `otp_attempt_${ip}`;
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 5;

  const record = attemptsMap.get(key) || { attempts: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }

  if (record.attempts >= maxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return next(
      createError(
        429,
        `Too many verification attempts. Please try again in ${minutesLeft} minute(s).`
      )
    );
  }

  // Attach record to req so controller can increment attempt count on failure
  req.otpRateLimit = {
    key,
    record,
    increment: () => {
      record.attempts += 1;
      attemptsMap.set(key, record);
    },
    reset: () => {
      attemptsMap.delete(key);
    },
  };

  next();
};
