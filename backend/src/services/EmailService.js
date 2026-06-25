const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const SystemSettingModel = require('../models/SystemSettingModel');

/**
 * Lấy tên người gửi và cài đặt autoSendEmail từ hệ thống
 */
const getEmailSettings = async () => {
    try {
        const setting = await SystemSettingModel.findOne().select('emailSenderName autoSendEmail').lean();
        return {
            senderName: setting?.emailSenderName || 'FitnFood Corporation',
            autoSendEmail: setting?.autoSendEmail || { verifyAccount: true, recoveryPassword: true, sendEmailOrder: true, restockNotification: true }
        };
    } catch {
        return {
            senderName: 'FitnFood Corporation',
            autoSendEmail: { verifyAccount: true, recoveryPassword: true, sendEmailOrder: true, restockNotification: true }
        };
    }
};

const verifyAccount = async ({ email, verificationCode }) => {
    try {
        const settings = await getEmailSettings();
        if (settings.autoSendEmail && settings.autoSendEmail.verifyAccount === false) {
            console.log("Bỏ qua gửi email xác thực tài khoản do bị tắt trong cài đặt hệ thống.");
            return;
        }
        const senderName = settings.senderName;
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
            from: `"${senderName}" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "MÃ XÁC THỰC TÀI KHOẢN FITNFOOD",
            html: htmlContent(verificationCode),
        });

        console.log("Đã gửi email xác thực tài khoản: %s", info.messageId);
    } catch (error) {
        console.error("Lỗi gửi email:", error);
    }
};

const recoveryPassword = async ({ email, token }) => {
    try {
        const settings = await getEmailSettings();
        if (settings.autoSendEmail && settings.autoSendEmail.recoveryPassword === false) {
            console.log("Bỏ qua gửi email khôi phục mật khẩu do bị tắt trong cài đặt hệ thống.");
            return;
        }
        const senderName = settings.senderName;
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
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}" class="button">
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
            from: `"${senderName}" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "KHÔI PHỤC MẬT KHẨU",
            html: htmlContent(token),
        });

        console.log("Đã gửi email khôi phục mật khẩu: %s", info.messageId);
    } catch (error) {
        console.error("Lỗi gửi email:", error);
    }
};


const sendEmailOrder = async ({ email, orderItems, totalPrice }) => {
    try {
        const settings = await getEmailSettings();
        if (settings.autoSendEmail && settings.autoSendEmail.sendEmailOrder === false) {
            console.log("Bỏ qua gửi email thông báo đơn hàng do bị tắt trong cài đặt hệ thống.");
            return;
        }
        const senderName = settings.senderName;
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // dùng SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Phân loại ảnh: base64 hay URL
        const isBase64 = (str) => typeof str === 'string' && str.startsWith('data:image');

        // Tạo attachments CID chỉ cho ảnh base64 (local dev)
        const base64Items = orderItems.map((item, index) => ({ item, index, isB64: isBase64(item.image) }));
        const attachments = base64Items
            .filter(({ isB64 }) => isB64)
            .map(({ item, index }) => ({
                filename: `${item.name}.jpg`,
                content: Buffer.from(item.image.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
                encoding: 'base64',
                cid: `image${index}@ecom`,
            }));

        // Hàm tạo nội dung HTML — dùng src URL nếu là URL, cid nếu là base64
        const htmlContent = (orderItems, totalPrice) => `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50; border-bottom: 1px solid #eee;">✅ Đơn hàng của bạn đã được xác nhận!</h2>
                <p>Cảm ơn bạn đã đặt hàng tại <strong>FitnFood Corporation</strong>. Dưới đây là thông tin đơn hàng của bạn:</p>

                <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Ảnh</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Sản phẩm</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Số lượng</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Giá gốc</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderItems.map((item, index) => {
            const imgSrc = isBase64(item.image)
                ? `cid:image${index}@ecom`
                : (item.image || '');
            return `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">
                            ${imgSrc
                    ? `<img src="${imgSrc}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" />`
                    : '<span style="color:#aaa;">Không có ảnh</span>'
                }
                        </td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.amount}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${item.price} VNĐ</td>
                    </tr>`;
        }).join('')}
                </tbody>
                </table>

                <p style="margin-top: 20px; font-size: 16px;"><strong>Tổng cộng (giá đã bao gồm giảm giá từ cửa hàng và mã giảm): ${totalPrice.toLocaleString()} VNĐ</strong></p>

                <p style="margin-top: 30px;">Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email hoặc số hotline trên website.</p>
                <p>Trân trọng,<br><strong>FitnFood Corporation</strong></p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"${senderName}" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "THÔNG BÁO ĐƠN HÀNG",
            html: htmlContent(orderItems, totalPrice),
            attachments,
        });

        console.log("Đã gửi email thông tin đơn hàng: %s", info.messageId);
    } catch (error) {
        console.error("Lỗi gửi email thông tin đơn hàng:", error);
    }
};

const sendRestockEmail = async ({ email, productName, productUrl }) => {
    try {
        const settings = await getEmailSettings();
        if (settings.autoSendEmail && settings.autoSendEmail.restockNotification === false) {
            console.log("Bỏ qua gửi email thông báo có hàng do bị tắt trong cài đặt hệ thống.");
            return;
        }
        const senderName = settings.senderName;
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
        const htmlContent = (name, url) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Sản phẩm đã có hàng trở lại</title>
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
                    color: #10B981;
                }
                p {
                    color: #555555;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    padding: 14px 24px;
                    background-color: #10B981;
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
                <h2>Tin vui: Đã có hàng! 🎉</h2>
                <p>Xin chào,</p>
                <p>Sản phẩm <strong>${name}</strong> mà bạn đang theo dõi hiện đã có hàng trở lại tại FitnFood.</p>
                <p>Số lượng có hạn, hãy nhanh tay đặt hàng ngay để không bỏ lỡ!</p>

                <!-- URL sản phẩm -->
                <a href="${url}" class="button">
                    Mua ngay bây giờ
                </a>

                <p>Cảm ơn bạn đã luôn đồng hành và ủng hộ FitnFood.</p>

                <div class="footer">
                    © 2025 FitnFood Corporation. All rights reserved.
                </div>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: `"${senderName}" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: "FITNFOOD - SẢN PHẨM ĐÃ CÓ HÀNG TRỞ LẠI",
            html: htmlContent(productName, productUrl),
        });

        console.log("Đã gửi email thông báo có hàng: %s", info.messageId);
    } catch (error) {
        console.error("Lỗi gửi email thông báo có hàng:", error);
    }
};

module.exports = {
    verifyAccount,
    recoveryPassword,
    sendEmailOrder,
    sendRestockEmail
};