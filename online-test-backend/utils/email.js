const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

exports.sendVerificationEmail = async (to, token) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Verify Your Email',
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your account:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/auth/verify/${token}">
          Verify Email
        </a>
      </p>
    `,
  });
};

exports.sendResetEmail = async (to, token) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Reset Your Password',
    html: `
      <h2>Reset your password</h2>
      <p>Click below to reset your password:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/auth/reset-password/${token}">
          Reset Password
        </a>
      </p>
    `,
  });
};

exports.sendLoginSuccessEmail = async (to) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Login Successful',
    html: `
      <h2>Login Successful</h2>
      <p>You have successfully logged in to your account.</p>
    `,
  });
};

exports.sendPasswordResetSuccessEmail = async (to) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Password Reset Successful',
    html: `
      <h2>Password Reset Successful</h2>
      <p>Your password has been reset successfully. You can now log in with your new password.</p>
    `,
  });
};
