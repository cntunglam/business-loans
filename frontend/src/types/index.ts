import Mail from 'nodemailer/lib/mailer';

export type Email = Pick<Mail.Options, 'from' | 'to' | 'subject' | 'text' | 'html' | 'cc' | 'bcc'>;
