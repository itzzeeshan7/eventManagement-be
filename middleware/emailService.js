const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (userEmail, token) => {
    const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Verify Your Email",
        html: `<h3>Click the link below to verify your email:</h3>
               <a href="${verificationLink}">Verify Now</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};


const sendApprovalEmail = async (userEmail, event) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Your Event Has Been Approved!",
        html: `<p>Dear User,</p>
               <p>Your event "<b>${event.title}</b>" has been approved.</p>
               <p>Event Date: ${event.date}</p>
               <p>Thank you for using our platform!</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Approval email sent to:", userEmail);
    } catch (error) {
        console.error("Error sending approval email:", error);
    }
};


module.exports = { sendVerificationEmail, sendApprovalEmail };
