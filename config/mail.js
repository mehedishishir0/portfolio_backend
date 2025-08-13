const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_SECRET,
  },
});

const sendEmail = async (emailData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: emailData.to,
      subject: emailData.subject,
      html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background-color:#f4f4f7;font-family: Arial, sans-serif;">
          <div style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color:#4f46e5;color:#ffffff;padding:20px;text-align:center;font-size:22px;font-weight:bold;">
              📩 New Contact Form Submission
            </div>
            
            <!-- Content -->
            <div style="padding:20px;color:#333333;line-height:1.6;font-size:16px;">
              <p><strong>Name:</strong> ${emailData.name}</p>
              <p><strong>Email:</strong> ${emailData.email}</p>
              <p><strong>Subject:</strong> ${emailData.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color:#f9fafb;border-left:4px solid #4f46e5;padding:10px;margin-top:5px;border-radius:4px;">
                ${emailData.message.replace(/\n/g, "<br/>")}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align:center;padding:15px;font-size:12px;color:#888888;background-color:#f9fafb;">
              &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
            </div>
            
          </div>
        </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

const sendEmailByresetPassword = async (emailData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: emailData.to,
      subject: emailData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2a7de1;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password. Click the button below to reset it:</p>

          <a href="${emailData.resetUrl}" 
             style="
               display: inline-block;
               padding: 12px 24px;
               margin: 20px 0;
               font-size: 16px;
               color: #ffffff;
               background-color: #2a7de1;
               text-decoration: none;
               border-radius: 5px;
             ">
            Reset My Password
          </a>

          <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;">
            <a href="${emailData.resetUrl}" style="color: #2a7de1;">${emailData.resetUrl}</a>
          </p>

          <p>If you didn’t request this, please ignore this email.</p>
          <p>Thanks,<br>Your Company Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error)
    throw error;
  }
};


module.exports = {sendEmailByresetPassword,sendEmail};
