# Padilla's Heating & Cooling — Local Dev

This repository contains a small static site and a minimal Express API that accepts booking requests and forwards them via Twilio, email, or writes to a local file.

Quick start (local):

1. Copy `.env.example` to `.env` and fill values. If you want the server to send SMS via Twilio, set the TWILIO_* variables and TWILIO_FROM_NUMBER. Otherwise set SMTP_* values for email, or leave both empty to log requests to `bookings.log`.

2. Install dependencies and start server:

```bash
npm install
npm start
```

3. Open http://localhost:8000 in your browser. Click "Book Online" to test the booking modal.

Notes:
- The server will serve static files and provide POST `/api/book`.
- The default company phone number is `COMPANY_PHONE` in `.env` (example: +19086722526).

Security:
- Keep API keys in `.env` and never commit them.
