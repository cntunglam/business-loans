import { Email } from '../../types';

export const email: Email = {
  from: {
    name: 'ROSHI',
    address: 'no-reply@roshi.sg'
  },
  to: 'hnguyen26@roshi.sg',
  subject: 'ROSHI Promotion!',
  text: 'ROSHI wants to thank you for using our services! We are pleased to inform you that your loan application has been successfully processed. If you have any questions or need further assistance, please do not hesitate to contact us. Thank you for choosing ROSHI!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for using our services!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Roshi Loan Application</h1>
        </div>
        <div class="content">
          <p>ROSHI wants to thank you for using our services!</p>
          <p>We are pleased to inform you that your loan application has been successfully processed.</p>
          <p>Here are the details of your application:</p>
          <ul>
            <li><strong>Application ID:</strong> 123456789</li>
            <li><strong>Loan Amount:</strong> $10,000</li>
            <li><strong>Interest Rate:</strong> 5%</li>
            <li><strong>Repayment Period:</strong> 12 months</li>
          </ul>
          <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
          <p>Thank you for choosing ROSHI!</p>
          <p>Best regards,</p>
          <p>The ROSHI Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Roshi Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};
