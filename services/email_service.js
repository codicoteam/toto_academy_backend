const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const { getAdminByEmail } = require('./admin_service');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Add this method
  async sendBulkEmail(recipients, subject, htmlContent) {
    const results = [];
    
    for (const [email,index]  of recipients) {
      try {
        if (index > 0)
        {
          await this.delay(3000); // im delaying sending of emals with 3 seconds
        }

        await this.transporter.sendMail({
          to: email,
          subject,
          html: htmlContent
        });
        results.push({ email, status: 'emails are now sent  sent' });
      } catch (error) {
        results.push({ email, status: 'sending failed', error: error.message });
      }
    }
    
    return results;
  }
}

module.exports = new EmailService();