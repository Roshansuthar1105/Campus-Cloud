const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    let transporter;
    let testAccount;
    let useTestAccount = false; // Set to false to use real email service

    // Check if we have valid email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || useTestAccount) {
      // Fall back to Ethereal Email for testing if no valid config
      console.log('Using Ethereal Email for testing...');
      testAccount = await nodemailer.createTestAccount();

      // Create a transporter using Ethereal Email
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } else {
      // Use configured email service
      console.log('Using configured email service...');
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }

    // Define email options
    const mailOptions = {
      from: testAccount
        ? `Test Account <${testAccount.user}>`
        : `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);

    // If using Ethereal, log the preview URL
    if (testAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Preview URL: ${previewUrl}`);

      return {
        success: true,
        previewUrl: previewUrl,
        isTestEmail: true
      };
    }

    return {
      success: true,
      isTestEmail: false
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
