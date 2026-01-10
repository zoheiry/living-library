const nodemailer = require("nodemailer");

// Check for real SMTP config
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    console.log(`Real email service configured with host: ${process.env.SMTP_HOST}`);
} else {
    // Fallback to Ethereal
    nodemailer.createTestAccount().then((account) => {
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass,
            },
        });
        console.log("Mock email server ready. Emails will be logged with a Preview URL when sent.");
    }).catch(err => {
        console.error('Failed to create test email account. Emails will not be sent.', err);
    });
}

const sendEmail = async (to, subject, text) => {
    if (!to) {
        console.log("No recipient defined. Email would have been:");
        console.log(`To: [Missing]\nSubject: ${subject}\nBody: ${text}`);
        return;
    }

    if (!transporter) {
        console.log("Transporter not ready, logging email to console instead.");
        console.log(`[PENDING EMAIL] To: ${to}\nSubject: ${subject}\nBody: ${text}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Living Bookshelf" <living-bookshelf@alizoh.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendEmail };
