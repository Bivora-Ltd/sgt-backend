const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, message) => {
  const htmlContent = `
   <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); background: linear-gradient(135deg, #f7fafc 0%, #f3f4f6 100%); border: none;">
      <div style="background: linear-gradient(90deg, #032e15 0%, #05DF72 100%); border-radius: 18px 18px 0 0; text-align: center; padding: 32px 0 18px 0;">
        <img src="https://res.cloudinary.com/dj0k071c3/image/upload/v1755855588/logo_cp8hbp.png" alt="Street Got Talent" style="height: 48px; margin-bottom: 10px;" />
        <h1 style="font-size: 28px; color: #fff; font-weight: 700; margin: 0;">${subject}</h1>
      </div>
      <div style="padding: 32px 24px 24px 24px; color: #222; line-height: 1.7; background: #fff;">
        <p style="font-size: 18px; margin: 0 0 16px 0;">${message}</p>
      </div>
      <div style="background: #032e15; border-radius: 0 0 18px 18px; text-align: center; padding: 18px 0 10px 0;">
        <p style="font-size: 13px; color: #a8a2a2ff; margin: 0;">&copy; 2024 Street Got Talent. All rights reserved.</p>
      </div>
      <div style="margin: 12px 0 0 0;">
        <a href="https://www.tiktok.com/@xpatainment?_t=8nbfITf0F3W&_r=1" target="_blank" style="margin: 0 18px; text-decoration: none;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/TikTok_logo.svg" alt="TikTok" style="width: 28px; height: 28px; vertical-align: middle; border-radius: 6px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.07);" />
          <span style="font-size: 15px; color: #ff6f00; font-weight: 600; margin-left: 6px; vertical-align: middle;">@xpatainment</span>
        </a>
        <a href="https://www.instagram.com/xpatainment_?igsh=aW1qc2RtaGt3bnBo" target="_blank" style="margin: 0 18px; text-decoration: none;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="width: 28px; height: 28px; vertical-align: middle; border-radius: 6px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.07);" />
          <span style="font-size: 15px; color: #d6249f; font-weight: 600; margin-left: 6px; vertical-align: middle;">@xpatainment_</span>
        </a>
        <a href="https://www.facebook.com/xpataintment?mibextid=kFxxJD" target="_blank" style="margin: 0 18px; text-decoration: none;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style="width: 28px; height: 28px; vertical-align: middle; border-radius: 6px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.07);" />
          <span style="font-size: 15px; color: #1877f3; font-weight: 600; margin-left: 6px; vertical-align: middle;">@xpatainment</span>
        </a>
        <a href="https://www.youtube.com/@xpatainment" target="_blank" style="margin: 0 18px; text-decoration: none;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" alt="YouTube" style="width: 28px; height: 28px; vertical-align: middle; border-radius: 6px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.07);" />
          <span style="font-size: 15px; color: #ff0000; font-weight: 600; margin-left: 6px; vertical-align: middle;">@xpatainment</span>
        </a>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Street Got Talent" <xpat@streetgottalent.com>',
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = sendEmail;
