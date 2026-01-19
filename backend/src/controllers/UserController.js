const UserService = require('../services/UserService');
// const JwtService = require('../services/JwtService');

const registerAccount = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, address, city } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const isCheckEmail = reg.test(email);

        //Trường hợp chưa nhập đủ thông tin
        if (!email || !password || !confirmPassword || !phone || !address || !city || !name) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields are required!"
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Invalid email format!"
            })
        } else if (confirmPassword != password) {
            return res.status(200).json({
                status: "ERR",
                message: "Passwords do not match!"
            })
        }

        const response = await UserService.registerAccount(req.body);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(404).json({
            status: "ERR",
            message: "Registration failed!"
        });
    }
}

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const isCheckEmail = reg.test(email);
        if (!email || !password) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields are required!"
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Invalid email format!"
            })
        }
        const response = await UserService.loginAccount(req.body)

        const { refresh_token, ...newRespone } = response
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict', // Fix lỗi viết sai chữ 'sameSite'
            path: '/', // Đảm bảo cookie có hiệu lực toàn bộ trang
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),  // 🛠 Set 365 ngày
            maxAge: 365 * 24 * 60 * 60 * 1000  // 🛠 Set 365 ngày
        })


        return res.status(200).json({ ...newRespone, refresh_token })

    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const verifyAccount = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const isCheckEmail = reg.test(email);
        if (!email || !verificationCode) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields are required!"
            })
        }
        if (!isCheckEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Invalid email format!"
            })
        }

        const response = await UserService.verifyAccount(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

module.exports = {
    registerAccount,
    loginAccount,
    verifyAccount
}