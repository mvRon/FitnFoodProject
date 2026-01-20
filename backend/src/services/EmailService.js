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

const recoveryPassword = async ({ email, token }) => {
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
        const htmlContent = (token) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Đặt lại mật khẩu</title>
                <style>
                body {
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                }
                h2 {
                    color: #333333;
                }
                p {
                    color: #555555;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color:rgb(146, 192, 240);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: bold;
                }
                .footer {
                    font-size: 12px;
                    color: #999999;
                    margin-top: 30px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <h2>Yêu cầu đặt lại mật khẩu</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu đó là bạn, vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu mới:</p>

                <!-- URL chứa token được chèn động tại backend -->
                <a href="${process.env.NODE_ENV === 'production' ?  'https://do-an-thuc-tap.vercel.app' : 'http://localhost:3000'}/reset-password?token=${token}" class="button">
                    Đặt lại mật khẩu
                </a>

                <p>Nếu bạn không yêu cầu hành động này, bạn có thể bỏ qua email này một cách an toàn.</p>

                <div class="footer">
                    © 2025 FitnFood Corporation. All rights reserved.
                </div>
                </div>
            </body>
            </html>

        `;

        const info = await transporter.sendMail({
            from: `"FitnFood Corporation" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "KHÔI PHỤC MẬT KHẨU",
            html: htmlContent(token),
        });

        console.log("✅ Đã gửi email khôi phục mật khẩu: %s", info.messageId);
    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
    }
};

module.exports = {
    verifyAccount,
    recoveryPassword
};