import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: config.smtp.user
    ? { user: config.smtp.user, pass: config.smtp.pass }
    : undefined,
});

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!config.smtp.user) {
    if (config.nodeEnv === "development") {
      console.log(`[DEV] Password reset for ${email}: ${resetUrl}`);
    }
    return;
  }
  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Reset your MockCertify password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!config.smtp.user) {
    if (config.nodeEnv === "development") {
      console.log(`[DEV] Welcome email to ${name} <${email}>`);
    }
    return;
  }
  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Welcome to MockCertify",
    html: `<p>Hi ${name}, welcome to MockCertify! Start practicing for your certification today.</p>`,
  });
}
