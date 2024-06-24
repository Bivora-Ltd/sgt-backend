// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465, // or 465 for SSL
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'xpat@streetgottalent.com', // Your email address
    pass: 'your-email-password' // Your email password
  }
});

const sendEmail = async (to, subject, message) => {
  const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
    <div style="text-align: center; padding: 10px 0; border-bottom: 1px solid #ccc;">
      <h1 style="font-size: 24px; color: #333;">${subject}</h1>
    </div>
    <div style="padding: 20px; color: #333; line-height: 1.5;">
      <p>${message}</p>
    </div>
    <div style="text-align: center; padding: 10px 0; border-top: 1px solid #ccc;">
      <p style="font-size: 12px; color: #777;">&copy; 2024 Street Got Talent. All rights reserved.</p>
    </div>
  </div>
  `;

  const mailOptions = {
    from: '"Street Got Talent" <xpat@streetgottalent.com>', // sender address
    to, 
    subject,
    html: htmlContent 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
