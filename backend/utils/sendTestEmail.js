const transporter = require("../config/mailer");

const sendTestEmail = async (to) => {

    try {

        await transporter.sendMail({

            from: `"LearnLoop" <${process.env.EMAIL_USER}>`,

            to,

            subject: "LearnLoop Email Test",

            html: `
                <h2>🎉 Congratulations!</h2>

                <p>Your LearnLoop email service is working correctly.</p>

                <p>If you're reading this, Nodemailer is successfully connected to Gmail.</p>

                <hr>

                <p><b>LearnLoop Team</b></p>
            `

        });

        console.log("✅ Test email sent");

    } catch (err) {

        console.error(err);

    }

};

module.exports = sendTestEmail;