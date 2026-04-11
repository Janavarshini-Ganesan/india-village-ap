const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
})

const sendWelcomeEmail = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"India Village API" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'Welcome to India Village API — Registration Received',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
          <div style="background: #fff; borderRadius: 16px; padding: 40px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; color: white; font-weight: 700;">IV</div>
              <h1 style="font-size: 24px; font-weight: 700; color: #1e1b4b; margin: 16px 0 8px;">India Village API</h1>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 16px;">Hi ${name}, welcome! 👋</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              Thank you for registering with India Village API. Your account has been received and is currently <strong>pending admin approval</strong>.
            </p>
            <div style="background: #fef9c3; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
              <p style="color: #854d0e; font-size: 14px; margin: 0; font-weight: 500;">
                ⏳ You will receive another email once your account is approved and ready to use.
              </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
              Once approved, you'll be able to:
            </p>
            <ul style="color: #64748b; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
              <li>Generate API keys from your dashboard</li>
              <li>Access 590,000+ villages across India</li>
              <li>Monitor your API usage in real-time</li>
            </ul>
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">India Village API • Built for B2B clients</p>
            </div>
          </div>
        </div>
      `
    })
    console.log(`✅ Welcome email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

const sendApprovalEmail = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"India Village API" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: '✅ Your Account is Approved — India Village API',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
          <div style="background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; color: white; font-weight: 700;">IV</div>
              <h1 style="font-size: 24px; font-weight: 700; color: #1e1b4b; margin: 16px 0 8px;">India Village API</h1>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✅</div>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 16px; text-align: center;">You're approved, ${name}!</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 24px; text-align: center;">
              Your India Village API account has been approved. You can now login and start using the API.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
                Login to Dashboard →
              </a>
            </div>
            <div style="background: #e0f2fe; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
              <p style="color: #0369a1; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Getting started:</p>
              <ol style="color: #0369a1; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
                <li>Login to your dashboard</li>
                <li>Generate your first API key</li>
                <li>Start making API requests</li>
              </ol>
            </div>
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">India Village API • Built for B2B clients</p>
            </div>
          </div>
        </div>
      `
    })
    console.log(`✅ Approval email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

const sendSuspensionEmail = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"India Village API" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'Account Suspended — India Village API',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
          <div style="background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0;">
            <h2 style="font-size: 20px; font-weight: 700; color: #991b1b; margin: 0 0 16px;">Account Suspended</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              Hi ${name}, your India Village API account has been suspended. Please contact support for more information.
            </p>
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">India Village API • Support: ${process.env.SMTP_EMAIL}</p>
            </div>
          </div>
        </div>
      `
    })
    console.log(`✅ Suspension email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

module.exports = { sendWelcomeEmail, sendApprovalEmail, sendSuspensionEmail }