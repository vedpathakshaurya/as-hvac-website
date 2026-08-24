const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+19735896304';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/book', async (req, res) => {
  try {
    const { name, phone, address, message, preferCall } = req.body || {};
    const bodyText = `New booking from website:\nName: ${name || ''}\nPhone: ${phone || ''}\nAddress: ${address || ''}\nPrefer call: ${preferCall ? 'yes' : 'no'}\nDetails: ${message || ''}`;

    // Try Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
      const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: COMPANY_PHONE,
        body: bodyText,
      });
      return res.json({ ok: true, via: 'twilio' });
    }

    // Fallback: send email via nodemailer if configured
    if (process.env.SMTP_HOST && process.env.EMAIL_TO) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'no-reply@example.com',
        to: process.env.EMAIL_TO,
        subject: 'Website Booking Request',
        text: bodyText,
      });
      return res.json({ ok: true, via: 'email' });
    }

    // Last resort: write to local file and return a fallback response so the client can open email
    const logLine = `${new Date().toISOString()} - ${bodyText}\n`;
    fs.appendFileSync(path.join(__dirname, 'bookings.log'), logLine, 'utf8');
    return res.status(202).json({
      ok: false,
      via: 'file',
      fallback: 'mailto',
      message: 'No SMS/email delivery provider is configured. The request was saved locally and you can send it via email.',
    });
  } catch (err) {
    console.error('Error in /api/book', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = { app };
