// utils/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function attemptSend(
  mailOptions: nodemailer.SendMailOptions,
  retries = 3
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent on attempt ${attempt}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      // Wait for a short time before retrying (e.g., 1 second * attempt number)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  try {
    return await attemptSend(mailOptions);
  } catch (error) {
    console.error("All attempts to send email failed:", error);
    // Here you could implement additional fallback logic
    throw error;
  }
}
