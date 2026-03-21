# Real Email Setup Guide for RideBazzar

## Overview
This guide will help you set up real email notifications for booking confirmations using EmailJS (free service).

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click "Sign Up" (it's FREE - 200 emails/month)
3. Verify your email address

## Step 2: Connect Your Email Service

1. After login, go to **"Email Services"** in the dashboard
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook**
   - **Yahoo**
   - Or any other SMTP service
4. Follow the connection wizard:
   - For Gmail: Click "Connect Account" and authorize
   - Note down the **Service ID** (e.g., "service_abc123")

## Step 3: Create Email Template

1. Go to **"Email Templates"** in the dashboard
2. Click **"Create New Template"**
3. Use this template content:

### Template Subject:
```
Booking Confirmation - {{car_name}} | RideBazzar
```

### Template Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f9b233 0%, #f39c12 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f9b233; }
        .section-title { font-size: 18px; font-weight: bold; color: #f9b233; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .highlight { color: #e74c3c; font-weight: bold; font-size: 20px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #f9b233; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Your booking has been confirmed</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>{{to_name}}</strong>,</p>
            <p>Thank you for booking with RideBazzar! Your payment has been processed successfully.</p>
            
            <div class="section">
                <div class="section-title">🚗 Vehicle Details</div>
                <div class="detail-row">
                    <span class="detail-label">Car:</span>
                    <span class="detail-value"><strong>{{car_name}}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Price:</span>
                    <span class="detail-value">{{car_price}}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">💰 Payment Information</div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value highlight">{{booking_amount}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">{{payment_method}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value"><code>{{transaction_id}}</code></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date:</span>
                    <span class="detail-value">{{booking_date}}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📋 Your Information</div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{buyer_phone}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">{{buyer_address}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Inspection Date:</span>
                    <span class="detail-value"><strong>{{inspection_date}}</strong></span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">✅ Next Steps</div>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Our team will contact you within 24 hours</li>
                    <li>Schedule vehicle inspection on <strong>{{inspection_date}}</strong></li>
                    <li>Complete remaining payment after inspection</li>
                    <li>Receive your car with all documents</li>
                </ol>
            </div>
            
            <div class="section">
                <div class="section-title">📞 Need Help?</div>
                <p style="margin: 10px 0;">
                    📱 Phone: <strong>{{support_phone}}</strong><br>
                    💬 WhatsApp: <strong>{{support_phone}}</strong><br>
                    📧 Email: <strong>{{support_email}}</strong>
                </p>
            </div>
            
            <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Important:</strong> Keep this email for your records. Your booking is valid for 7 days.
            </p>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing RideBazzar!</p>
            <p>&copy; 2025 RideBazzar. All rights reserved.</p>
            <p>www.ridebazzar.com</p>
        </div>
    </div>
</body>
</html>
```

4. Click **"Save"** and note down the **Template ID** (e.g., "template_xyz789")

## Step 4: Update Your Code

1. Open `payment.html` in your code editor
2. Find these lines near the top:
```javascript
emailjs.init({
  publicKey: "YOUR_PUBLIC_KEY", // Replace with your EmailJS public key
});
```

3. Replace `YOUR_PUBLIC_KEY` with your actual **Public Key** from EmailJS dashboard (Account > API Keys)

4. Find this line in the `sendBookingConfirmationEmail` function:
```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

5. Replace:
   - `YOUR_SERVICE_ID` with your Service ID from Step 2
   - `YOUR_TEMPLATE_ID` with your Template ID from Step 3

Example:
```javascript
emailjs.send('service_abc123', 'template_xyz789', templateParams)
```

## Step 5: Test Your Setup

1. Make a test booking on your website
2. Complete the payment process
3. Check your email inbox (including spam folder)
4. You should receive a beautifully formatted confirmation email!

## Troubleshooting

### Email not received?
1. Check browser console for errors (F12 > Console tab)
2. Verify all IDs are correct (Public Key, Service ID, Template ID)
3. Check EmailJS dashboard for delivery status
4. Check spam/junk folder
5. Ensure email service is properly connected in EmailJS

### Rate Limits
- Free plan: 200 emails/month
- If you need more, upgrade to a paid plan ($9/month for 1000 emails)

## Alternative: Backend Email Service

If you prefer server-side email sending, you can:

1. **Use Node.js backend with Nodemailer:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// Send email
await transporter.sendMail({
  from: 'ridebazzar@gmail.com',
  to: buyerEmail,
  subject: 'Booking Confirmation',
  html: emailTemplate
});
```

2. **Use SendGrid API** (recommended for production)
3. **Use AWS SES** (cheapest for high volume)
4. **Use Mailgun** (good for transactional emails)

## Security Notes

⚠️ **Never commit API keys to GitHub!**
- Store keys in environment variables
- Use `.env` file for local development
- Add `.env` to `.gitignore`

## Support

For issues with EmailJS: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)

For RideBazzar support: Contact your development team

---

**Last Updated:** December 24, 2025
