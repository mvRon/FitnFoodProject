const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const verifyAccount = async ({ email, verificationCode }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // dùng SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Hàm tạo nội dung HTML
        const htmlContent = (verificationCode) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Mã xác nhận của bạn</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0;">
                <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <tr>
                    <td style="padding: 20px; background-color: #4facfe; color: white; text-align: center;">
                    <h2 style="margin: 0;">XÁC NHẬN TÀI KHOẢN</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                    <p>Xin chào,</p>
                    <p>Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã bên dưới để xác nhận tài khoản của bạn:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 25px; font-size: 24px; background-color: #e0f7fa; color: #00796b; border-radius: 8px; font-weight: bold;">
                        ${verificationCode}
                        </span>
                    </div>
                    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 15px; text-align: center; font-size: 12px; color: #888;">
                    © 2025 FitnFood Corporation. All rights reserved.
                    </td>
                </tr>
                </table>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: `"FitnFood Corporation" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "MÃ XÁC THỰC TÀI KHOẢN FITNFOOD",
            html: htmlContent(verificationCode),
        });

        console.log("✅ Đã gửi email xác thực tài khoản: %s", info.messageId);
    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
    }
};

module.exports = {
    verifyAccount
};