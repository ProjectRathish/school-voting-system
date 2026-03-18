const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendSchoolApprovalEmail = async (email, schoolName, schoolCode, password) => {
  console.log(`Attempting to send approval email to: ${email}`);
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?school=${schoolCode}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Success! ${schoolName} Account Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background: #1a237e; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">Welcome to School Voting</h1>
          <p style="margin-top: 10px; opacity: 0.8;">Your institution has been successfully onboarded</p>
        </div>
        
        <div style="padding: 30px; line-height: 1.6; color: #333;">
          <p>Dear Administrator,</p>
          <p>We are pleased to inform you that <strong>${schoolName}</strong> has been approved on our platform. Your digital voting infrastructure is now ready to use.</p>
          
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #1a237e;">
            <p style="margin: 0; font-size: 14px; color: #666;">Login Credentials:</p>
            <p style="margin: 10px 0 5px 0;"><strong>School Code:</strong> <code style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${schoolCode}</code></p>
            <p style="margin: 5px 0 10px 0;"><strong>Password:</strong> <code style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${password}</code></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #3949ab; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #777; font-style: italic;">
            Note: For security reasons, please change your password immediately after your first login.
          </p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
          &copy; ${new Date().getFullYear()} School Voting System. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
