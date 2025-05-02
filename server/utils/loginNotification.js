const sendEmail = require('./emailService');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Send a login notification email to the user
 * @param {Object} user - User object
 * @param {Object} req - Express request object
 */
const sendLoginNotification = async (user, req) => {
  try {
    // Check if user has opted out of login notifications
    if (user.receiveLoginNotifications === false) {
      console.log(`Login notification skipped for ${user.email} (opted out)`);
      return false;
    }

    // Get IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Get location from IP (if available)
    const geo = geoip.lookup(ip) || { city: 'Unknown', country: 'Unknown' };

    // Get device and browser info
    const ua = UAParser(req.headers['user-agent']);
    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`;
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`;
    const device = ua.device.vendor ? `${ua.device.vendor} ${ua.device.model}` : 'Desktop/Laptop';

    // Format date and time
    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Create email template
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .info-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            color: #4b5563;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>We detected a new login to your Campus Cloud account. If this was you, no action is needed. If you didn't log in recently, please change your password immediately.</p>

            <div class="info-box">
              <div class="info-item">
                <span class="label">Time:</span> ${loginTime}
              </div>
              <div class="info-item">
                <span class="label">Location:</span> ${geo.city}, ${geo.country}
              </div>
              <div class="info-item">
                <span class="label">Device:</span> ${device}
              </div>
              <div class="info-item">
                <span class="label">Browser:</span> ${browser}
              </div>
              <div class="info-item">
                <span class="label">Operating System:</span> ${os}
              </div>
            </div>

            <p>If you don't recognize this activity, please:</p>
            <ol>
              <li>Change your password immediately</li>
              <li>Contact our support team</li>
            </ol>
          </div>
          <div class="footer">
            <p>This is an automated security notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Campus Cloud. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    try {
      // Use the sendEmail utility function
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'New Login to Your Campus Cloud Account',
        html: message
      });

      // If using Ethereal Email for testing, log the preview URL
      if (emailResult.isTestEmail && emailResult.previewUrl) {
        console.log(`Login notification email preview URL: ${emailResult.previewUrl}`);
      }

      console.log(`Login notification email sent to ${user.email}`);
      return true;
    } catch (emailError) {
      console.error('Error sending login notification email:', emailError);
      // Don't fail the login process if email fails
      return false;
    }
  } catch (error) {
    console.error('Error preparing login notification email:', error);
    return false;
  }
};

module.exports = sendLoginNotification;
