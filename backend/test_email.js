require('dotenv').config();
const { sendSchoolApprovalEmail } = require('./utils/emailService');

async function test() {
  console.log('Testing email service...');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  
  const result = await sendSchoolApprovalEmail(
    'evotesolution@gmail.com', // sending to self for testing
    'Test School',
    'TEST001',
    'password123'
  );
  
  if (result) {
    console.log('✅ Email sent successfully');
  } else {
    console.log('❌ Email failed to send.');
  }
  process.exit(0);
}

test();
