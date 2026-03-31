const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendWelcomeEmail(to, username) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Welcome to Refyn!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Welcome to Refyn, ${username}!</h2>
        <p>Your account has been created successfully. You can now:</p>
        <ul>
          <li>Create code reviews and invite collaborators</li>
          <li>Review code with inline comments and diff views</li>
          <li>Connect your GitHub repositories</li>
        </ul>
        <p>Happy reviewing!</p>
        <p style="color: #888; font-size: 12px;">&mdash; The Refyn Team</p>
      </div>
    `
  });
}

async function sendReviewFinalizedEmail(to, { reviewTitle, status, authorName }) {
  const statusLabel = status === 'approved' ? 'Approved' : 'Rejected';
  const color = status === 'approved' ? '#16a34a' : '#dc2626';

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Review "${reviewTitle}" has been ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Hi ${authorName},</h2>
        <p>Your code review <strong>${reviewTitle}</strong> has been finalized.</p>
        <p style="font-size: 18px; font-weight: bold; color: ${color};">
          Status: ${statusLabel}
        </p>
        <p>Log in to Refyn to see the full details, comments, and votes.</p>
        <p style="color: #888; font-size: 12px;">&mdash; The Refyn Team</p>
      </div>
    `
  });
}

module.exports = { sendWelcomeEmail, sendReviewFinalizedEmail };
