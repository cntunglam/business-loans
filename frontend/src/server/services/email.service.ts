import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Email } from '../../types';

interface IEmailService {
  sendEmail: (email: Email) => Promise<SMTPTransport.SentMessageInfo>;
}

const createTransporter = () => {
  const smtpConfig: SMTPTransport.Options = {
    host: process.env.MAIL_HOST || 'localhost',
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 1025,
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth:
      process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD
        ? {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
          }
        : undefined,
    tls: {
      ciphers: process.env.MAIL_ENCRYPTION === 'ssl' ? 'SSLv3' : 'TLSv1.2',
      rejectUnauthorized: false // Use this for development only
    },
    from: {
      name: process.env.MAIL_FROM_NAME || 'ROSHI',
      address: process.env.MAIL_FROM_ADDRESS || 'no-reply@roshi.sg'
    }
  };

  return nodemailer.createTransport(smtpConfig);
};

const emailService: IEmailService = {
  sendEmail: async (email) => {
    let transporter;
    try {
      transporter = createTransporter();

      // Verify connection configuration before sending
      await transporter.verify().catch((err) => {
        console.error('SMTP Connection Verification Failed:', err);
        throw new Error(`SMTP Connection Failed: ${err.message}`);
      });

      console.log('SMTP Connection Verified Successfully');

      // Sending the email
      const result = await transporter.sendMail(email);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};

export default emailService;
