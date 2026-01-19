const UserService = require('../services/UserService');
// const JwtService = require('../services/JwtService');

const registerAccount = async (req, res) => {
    try{
        const { name, email, password, confirmPassword, phone, address, city  } = req.body;
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(200).json({
                status: "ERR",
                message: "Email and password are required!"
            })
        }

        const response = await UserService.login(req.body);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(404).json({
            status: "ERR",
            message: "Login failed!"
        });
    }
}

module.exports = {
    registerAccount,
    login
}