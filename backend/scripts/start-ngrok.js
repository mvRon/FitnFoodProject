/**
 * start-ngrok.js
 * 
 * Script khởi động Ngrok tunnel và tự động cập nhật NGROK_URL trong .env.
 * 
 * Cách dùng:
 *   node scripts/start-ngrok.js
 * 
 * Yêu cầu:
 *   1. Tạo tài khoản miễn phí tại https://ngrok.com
 *   2. Lấy authtoken từ https://dashboard.ngrok.com/get-started/your-authtoken
 *   3. Điền vào biến NGROK_AUTHTOKEN trong .env (hoặc chạy: ngrok config add-authtoken <token>)
 */

require('dotenv').config();
const ngrok = require('@ngrok/ngrok');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;
const ENV_FILE = path.join(__dirname, '..', '.env');

async function updateEnvFile(key, value) {
    try {
        let content = fs.readFileSync(ENV_FILE, 'utf8');
        const regex = new RegExp(`^${key}\\s*=.*$`, 'm');
        if (regex.test(content)) {
            content = content.replace(regex, `${key} = ${value}`);
        } else {
            content += `\n${key} = ${value}\n`;
        }
        fs.writeFileSync(ENV_FILE, content, 'utf8');
        console.log(`✅ Đã cập nhật ${key} = ${value} vào .env`);
    } catch (err) {
        console.error('❌ Không thể cập nhật .env:', err.message);
    }
}

async function main() {
    // Kiểm tra authtoken
    const authtoken = process.env.NGROK_AUTHTOKEN;
    if (!authtoken) {
        console.log('\n⚠️  Thiếu NGROK_AUTHTOKEN trong .env!');
        console.log('👉 Hướng dẫn:');
        console.log('   1. Đăng ký miễn phí tại: https://ngrok.com');
        console.log('   2. Lấy authtoken tại: https://dashboard.ngrok.com/get-started/your-authtoken');
        console.log('   3. Thêm vào .env: NGROK_AUTHTOKEN = <your_token>');
        console.log('   4. Chạy lại script này\n');
        console.log('Hoặc nếu đã cài ngrok CLI: chạy "ngrok http 3001" rồi copy URL vào NGROK_URL trong .env\n');
        process.exit(1);
    }

    try {
        console.log(`🚀 Đang khởi động Ngrok tunnel cho port ${PORT}...`);

        // Kết nối Ngrok sử dụng SDK chính thức của Ngrok (@ngrok/ngrok)
        const listener = await ngrok.forward({
            addr: PORT,
            authtoken,
            // Nếu có domain cố định (trả phí), uncomment và điền vào:
            // domain: 'your-static-domain.ngrok-free.app',
        });
        const url = listener.url();

        console.log(`\n✅ Ngrok tunnel đang chạy!`);
        console.log(`📡 Public URL: ${url}`);
        console.log(`🔗 Webhook URL cho PayOS: ${url}/api/payment/webhook`);
        console.log('\n💡 Copy URL trên và cài vào PayOS Dashboard > Webhook URL\n');

        // Cập nhật NGROK_URL vào .env
        await updateEnvFile('NGROK_URL', url);

        // Khởi động backend server với nodemon (auto-reload khi file thay đổi)
        console.log('🚀 Đang khởi động backend server với nodemon...\n');
        const server = spawn('npx', ['nodemon', 'src/index.js'], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, NGROK_URL: url },
        });

        server.on('close', async (code) => {
            console.log(`\nBackend server thoát với code: ${code}`);
            try {
                await listener.close();
            } catch (e) { }
            process.exit(code);
        });

        // Xử lý tắt gracefully
        const cleanup = async () => {
            console.log('\n🛑 Đang tắt Ngrok...');
            try {
                await listener.close();
            } catch (e) { }
            server.kill();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (err) {
        console.error('❌ Lỗi khởi động Ngrok:', err.message);
        if (err.message?.includes('authtoken')) {
            console.log('\n💡 Lỗi authtoken. Hãy kiểm tra lại NGROK_AUTHTOKEN trong .env');
        }
        process.exit(1);
    }
}

main();
