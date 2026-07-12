const transporter = require("../config/mailer");

const sendOTP = async (email, otp) => {

    await transporter.sendMail({

        from: `"LearnLoop" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "Verify your LearnLoop Account",

        html: `

        <div style="font-family:Arial">

            <h2>Welcome to LearnLoop 🎉</h2>

            <p>Your verification code is</p>

            <h1>${otp}</h1>

            <p>This OTP expires in 5 minutes.</p>

            <p>Please do not share this OTP.</p>

        </div>

        `

    });

};

module.exports = sendOTP;