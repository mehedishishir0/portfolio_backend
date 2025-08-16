const createError = require("http-errors");
const { successResponse } = require("../response/response");
const { sendEmail } = require("../config/mail");

exports.postContactus = async (req, res, next) => {
  try {
    console.log(req.body)
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      throw createError(404, "all faild are required");
    }
     await sendEmail({
      to: "mehedihasanshishir.info@gmail.com",
      subject: `Contact Form: ${subject}`,
      name,
      email,
      message,
    });

    successResponse(res, {
      statusCode: 200,
      message: "Email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
