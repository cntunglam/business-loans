import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Email } from '../../types';

interface IEmailService {
  sendEmail: (email: Email) => Promise<SMTPTransport.SentMessageInfo>;
}

const createTransporter = () => {
  // Log environment values for debugging
  console.log('Email Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MAIL_HOST:', process.env.MAIL_HOST);
  console.log('MAIL_PORT:', process.env.MAIL_PORT);
  console.log('MAIL_USERNAME:', process.env.MAIL_USERNAME ? '[SET]' : '[NOT SET]');
  console.log('MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME);
  console.log('MAIL_FROM_ADDRESS:', process.env.MAIL_FROM_ADDRESS);

  const smtpConfig: SMTPTransport.Options = {
    host: process.env.MAIL_HOST || 'localhost',
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 1025,
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth: {
      user: process.env.MAIL_USERNAME || '',
      pass: process.env.MAIL_PASSWORD || ''
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false // Use this for development only
    },
    from: {
      name: process.env.MAIL_FROM_NAME || 'ROSHI',
      address: process.env.MAIL_FROM_ADDRESS || 'no-reply@roshi.sg'
    }
  };

  console.log('SMTP Config:', JSON.stringify(smtpConfig, null, 2));

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
