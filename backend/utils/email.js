const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    // For development, use a test account or configure with real SMTP
    // You can use Gmail, SendGrid, or any other email service
    
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || 'ridebazzar2024@gmail.com',
            pass: process.env.SMTP_PASS || '' // Add your email password in .env
        }
    });
};

// Send booking confirmation email to buyer
const sendBookingConfirmation = async (bookingDetails) => {
    try {
        const transporter = createTransporter();
        
        const { buyer, seller, car, booking, transaction } = bookingDetails;
        
        const mailOptions = {
            from: `"RideBazzar" <${process.env.SMTP_USER || 'ridebazzar2024@gmail.com'}>`,
            to: buyer.email,
            subject: `🚗 Booking Confirmation - ${car.make} ${car.model} (ID: ${transaction.id})`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f9b233 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .section { margin-bottom: 25px; }
        .section-title { color: #f9b233; font-weight: bold; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #f9b233; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .info-label { color: #666; }
        .info-value { font-weight: bold; color: #333; }
        .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
        .button { background: #f9b233; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎉 Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing RideBazzar</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Payment Successful</div>
            
            <div class="section">
                <div class="section-title">🚗 Vehicle Details</div>
                <div class="info-row">
                    <span class="info-label">Car:</span>
                    <span class="info-value">${car.make} ${car.model} ${car.year}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Registration No:</span>
                    <span class="info-value">${car.registration_number || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fuel Type:</span>
                    <span class="info-value">${car.fuel_type || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Price:</span>
                    <span class="info-value">₹${parseFloat(car.price).toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">💳 Payment Details</div>
                <div class="info-row">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value">${transaction.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">₹${parseFloat(booking.booking_amount).toLocaleString('en-IN')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${transaction.payment_method.toUpperCase()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Date:</span>
                    <span class="info-value">${new Date().toLocaleDateString('en-IN')}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">👤 Buyer Information</div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${buyer.username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${buyer.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${buyer.phone || 'N/A'}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📋 Next Steps</div>
                <ol style="padding-left: 20px;">
                    <li>Our team will contact you within 24 hours</li>
                    <li>Schedule vehicle inspection${booking.inspection_date ? ` on ${new Date(booking.inspection_date).toLocaleDateString('en-IN')}` : ''}</li>
                    <li>Complete remaining payment after inspection approval</li>
                    <li>Receive your car with all documents</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/dashboard.html" class="button">View My Bookings</a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Important:</strong> Keep this email for your records. Your booking is valid for 7 days.
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Need Help?</strong></p>
            <p style="margin: 5px 0;">📞 +91 9082073676 | 📧 support@ridebazzar.com</p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
                © 2026 RideBazzar. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Buyer confirmation email sent:', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending buyer confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Send notification to seller
const sendSellerNotification = async (bookingDetails) => {
    try {
        const transporter = createTransporter();
        
        const { buyer, seller, car, booking, transaction } = bookingDetails;
        
        const mailOptions = {
            from: `"RideBazzar" <${process.env.SMTP_USER || 'ridebazzar2024@gmail.com'}>`,
            to: seller.email,
            subject: `💰 New Booking - ${car.make} ${car.model} sold!`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .section { margin-bottom: 25px; }
        .section-title { color: #28a745; font-weight: bold; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #28a745; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .info-label { color: #666; }
        .info-value { font-weight: bold; color: #333; }
        .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
        .button { background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎊 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your car has been booked</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Payment Received: ₹${parseFloat(booking.booking_amount).toLocaleString('en-IN')}</div>
            
            <div class="section">
                <div class="section-title">🚗 Vehicle Details</div>
                <div class="info-row">
                    <span class="info-label">Car:</span>
                    <span class="info-value">${car.make} ${car.model} ${car.year}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Listing Price:</span>
                    <span class="info-value">₹${parseFloat(car.price).toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">👤 Buyer Information</div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${buyer.username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${buyer.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${buyer.phone || 'N/A'}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">💳 Transaction Details</div>
                <div class="info-row">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value">${transaction.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Booking Amount:</span>
                    <span class="info-value">₹${parseFloat(booking.booking_amount).toLocaleString('en-IN')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${new Date().toLocaleDateString('en-IN')}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📋 Next Steps</div>
                <ol style="padding-left: 20px;">
                    <li>Prepare the vehicle for inspection</li>
                    <li>Our team will coordinate with the buyer</li>
                    <li>Complete vehicle inspection process</li>
                    <li>Receive remaining payment after successful inspection</li>
                    <li>Transfer ownership documents</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/dashboard.html" class="button">View Sale Details</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Need Help?</strong></p>
            <p style="margin: 5px 0;">📞 +91 9082073676 | 📧 support@ridebazzar.com</p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
                © 2026 RideBazzar. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Seller notification email sent:', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending seller notification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendBookingConfirmation,
    sendSellerNotification
};
