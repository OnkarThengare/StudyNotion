const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,          // REQUIRED for Gmail
            secure: false,      // TLS
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            // from: 'StudyNotion || CodeHelp - by OmiiBhai',
            from: `"StudyNotion" <${process.env.MAIL_USER}>`, //  valid sender
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });
        console.log("Mail Send", error);
        return info;

    } catch (error) {
        console.log("Error occured  while sending Mail: ", error.message);
    }
};

module.exports = mailSender;