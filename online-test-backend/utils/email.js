const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendVerificationEmail = async (to, token) => {
  await sgMail.send({
    from: process.env.SENDGRID_FROM,
    to,
    subject: "Verify Your Email",
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
  await sgMail.send({
    from: process.env.SENDGRID_FROM,
    to,
    subject: "Reset Your Password",
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
  await sgMail.send({
    from: process.env.SENDGRID_FROM,
    to,
    subject: "Login Successful",
    html: `
      <h2>Login Successful</h2>
      <p>You have successfully logged in to your account.</p>
    `,
  });
};

exports.sendPasswordResetSuccessEmail = async (to) => {
  await sgMail.send({
    from: process.env.SENDGRID_FROM,
    to,
    subject: "Password Reset Successful",
    html: `
      <h2>Password Reset Successful</h2>
      <p>Your password has been reset successfully. You can now log in with your new password.</p>
    `,
  });
};
