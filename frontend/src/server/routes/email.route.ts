import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { loanPurposesEnum, loanPurposesLabels } from '../../constants/applicationData';
import { EmailDataType } from '../../context/visitorContext';
import { Email } from '../../types';
import emailService from '../services/email.service';
import { getEmailTemplate } from '../utils';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many email requests from this IP, please try again later.'
});

export default function emailRequestHandler(app: express.Express) {
  app.get('/api/email', emailLimiter, async (_: express.Request, res: express.Response) => {
    const email = getEmailTemplate('hnguyen26@roshi.sg');

    try {
      const emails = await emailService.sendEmail(email);
      res.status(200).json(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).send('Error fetching emails');
    }
  });

  app.post('/api/email', emailLimiter, async (req: express.Request<unknown, unknown, EmailDataType, unknown>, res: express.Response) => {
    // Cast the request body to the expected type
    const reqBody = req.body;
    const data: EmailDataType = {
      ...reqBody,
      borrowPurpose: loanPurposesLabels[reqBody.borrowPurpose as loanPurposesEnum]
    };

    // Handle different paths in dev vs production
    let templatePath = path.join(__dirname, '../email-template/emailTemplate.hbs'); // Production path

    // If template doesn't exist, try development path
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(__dirname, 'email-template/emailTemplate.hbs');
    }

    // Final fallback - try relative path from cwd
    if (!fs.existsSync(templatePath)) {
      templatePath = path.resolve(process.cwd(), 'dist/server/email-template/emailTemplate.hbs');
    }

    console.log(`Loading email template from: ${templatePath}`);

    if (!fs.existsSync(templatePath)) {
      console.error(`Email template not found at: ${templatePath}`);
      res.status(500).send('Email template not found');
      throw new Error(`Email template not found at: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const emailTemplate = handlebars.compile(templateContent);
    const emailHtml = emailTemplate(data);

    try {
      const email: Email = {
        from: {
          name: process.env.MAIL_FROM_NAME || 'ROSHI',
          address: process.env.MAIL_FROM_ADDRESS || 'no-reply@roshi.sg'
        },
        to: data.email,
        subject: 'ROSHI Promotion!',
        text: 'ROSHI wants to thank you for using our services! We are pleased to inform you that your loan application has been successfully processed. If you have any questions or need further assistance, please do not hesitate to contact us. Thank you for choosing ROSHI!',
        html: emailHtml
      };

      await emailService.sendEmail(email);
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
    }
  });
}
