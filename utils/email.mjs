import nodemailer from 'nodemailer';
import config from '../config.mjs';

export default async function createAndSendEmail({ to, subject, message }) {
  // Create transporter
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: config.SANDBOX_USERNAME,
      pass: config.SANDBOX_PASSWORD,
    },
  });

  const transportGmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USERNAME,
      pass: config.GMAIL_PASSWORD,
    },
  });

  await transportGmail.sendMail({
    from: 'Yash Lohia',
    // to: 'yashlohia1001@gmail.com',
    to,
    subject,
    text: message,
  });
}
