import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass || emailPass === "your_app_password") {
        console.error(
            "Email not sent: set valid EMAIL_USER and Gmail App Password in environment.",
        );
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        await transporter.verify();

        await transporter.sendMail({
            from: `"Company-Attendance" <${emailUser}>`,
            to,
            subject,
            text,
            ...(html ? { html } : {}),
        });

        return true;
    } catch (error) {
        const code = error?.responseCode ? ` (code: ${error.responseCode})` : "";
        console.error(`Error sending email${code}: ${error.message}`);
        return false;
    }
};