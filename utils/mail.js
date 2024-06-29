const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, message) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <div style="text-align: center; padding: 10px 0; border-bottom: 1px solid #ccc;">
        <h1 style="font-size: 24px; color: #333;">${subject}</h1>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.5;">
        <p>${message}</p>
      </div>
      <div style="text-align: center; padding: 10px 0; border-top: 1px solid #ccc;">
        <p style="font-size: 12px; color: #777;">&copy; 2024 Street Got Talent. All rights reserved.</p>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://www.tiktok.com/@streetsgottalent_" target="_blank" style="margin-right: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/TikTok_logo.svg" alt="TikTok" style="vertical-align: middle; width: 24px; height: 24px;" />
          <span style="font-size: 16px; color: #333; text-decoration: none; vertical-align: middle;">@streetgottalent</span>
        </a>
        <a href="https://www.instagram.com/streetsgottalent_/" target="_blank">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="vertical-align: middle; width: 24px; height: 24px;" />
          <span style="font-size: 16px; color: #333; text-decoration: none; vertical-align: middle;">@streetgottalent</span>
        </a>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Street Got Talent" <xpat@streetgottalent.com>',
    to,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;
