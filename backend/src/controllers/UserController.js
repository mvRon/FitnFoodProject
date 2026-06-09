const UserService = require('../services/UserService');
const JwtService = require('../services/JwtService');

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


const logoutAccount = async (req, res) => {
    try {
        res.clearCookie('refresh_token')
        return res.status(200).json({
            status: 'OK',
            message: 'Logout successfully'
        })
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const refreshToken = async (req, res) => {
    try {
        // const token = req.cookies.refresh_token
        const token = req.headers.token?.split(' ')[1] // Lấy token từ header Authorization byRon

        if (!token) {
            return res.status(200).json({
                status: "ERR",
                message: "Token required!"
            })
        }
        const response = await JwtService.refreshToken(token)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const isCheckEmail = reg.test(email);
        if (!email) {
            return res.status(200).json({
                status: "ERR",
                message: "Email required!",
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Invalid email format!"
            })
        }
        const response = await UserService.forgotPassword(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const result = await UserService.resetPassword(token, newPassword);

        if (result.success) {
            return res.status(200).json({
                status: 'OK',
                message: 'Password reset successfully'
            });
        }

        return res.status(400).json({
            status: 'ERR',
            message: result.message
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.id; // Lấy từ authUserMiddleWare
        const { oldPassword, newPassword } = req.body;
        
        if (!userId) {
            return res.status(200).json({
                status: "ERR",
                message: "User ID required!"
            });
        }
        if (!oldPassword || !newPassword) {
             return res.status(200).json({
                status: "ERR",
                message: "All fields are required!"
            });
        }
        
        const response = await UserService.changePassword(userId, oldPassword, newPassword);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        if (!userId) {
            return res.status(200).json({
                status: "ERR",
                message: "User ID required!"
            })
        }
        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(200).json({
                status: "ERR",
                message: "User ID required!"
            })
        }
        const response = await UserService.deleteUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const response = await UserService.getAllUsers();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ req.user được gán trong authUserMiddleWare
        const response = await UserService.getUserDetails(userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
};

module.exports = {
    registerAccount,
    loginAccount,
    verifyAccount,
    logoutAccount,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserDetails
}