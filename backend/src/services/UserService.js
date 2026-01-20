const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { genToken, refresh_genToken } = require("./JwtService");
const { response } = require("express");
const EmailService = require("./EmailService");
const PasswordResetToken = require('../models/PasswordResetToken');

const registerAccount = async (newAccount) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if email already exists
            const existingUser = await User.findOne({ email: newAccount.email });
            if (existingUser) {
                return resolve({
                    status: "ERR",
                    message: "Email is already registered!"
                });
            }
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newAccount.password, salt);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Create new user
            const user = await User.create({
                name: newAccount.name,
                email: newAccount.email,
                password: hashedPassword,
                phone: newAccount.phone,
                address: newAccount.address,
                city: newAccount.city,
                verificationCode: verificationCode
            });
            if (user) {
                await EmailService.verifyAccount({ email: user.email, verificationCode });
                return resolve({
                    status: "OK",
                    message: "Registration successful!",
                    data: user
                });
            }
        } catch (error) {
            return reject(error);
        }
    })
}

const loginAccount = async (loginData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email: loginData.email });
            if (!user) {
                return resolve({
                    status: "ERR",
                    message: "Username or password is incorrect!"
                });
            }

            const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
            if (!isPasswordValid) {
                return resolve({
                    status: "ERR",
                    message: "Username or password is incorrect!"
                });
            }

            //Xử lý tài khoản chưa được xác minh
            if (!user.isVerified) {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                user.verificationCode = verificationCode;
                await user.save();
                await EmailService.verifyAccount({ email: user.email, verificationCode });
                return resolve({
                    status: "ERR",
                    message: "Account not verified! A new verification code has been sent to your email."
                });
            }


            const access_token = await genToken({
                id: user.id,
                isAdmin: user.isAdmin,
            });

            const refresh_token = await refresh_genToken({
                id: user.id,
                isAdmin: user.isAdmin,
            });

            return resolve({
                status: "OK",
                message: "Login successful!",
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                access_token,
                refresh_token
            });
        } catch (error) {
            return reject(error);
        }
    })
}

const verifyAccount = (user) => {
    return new Promise(async (resolve, reject) => {
        const { email, verificationCode } = user
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (!checkUser) {
                return resolve({
                    status: "ERR",
                    message: "User not found!"
                })
            }
            if (checkUser.verificationCode !== verificationCode) {
                return resolve({
                    status: "ERR",
                    message: "Invalid verification code!"
                })
            }

            checkUser.isVerified = true;
            checkUser.verificationCode = undefined;
            const response = await checkUser.save()
            if (response) {
                resolve({
                    status: "OK",
                    message: "Account verification successful!",
                    data: checkUser
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

const forgotPassword = (userInfo) => {
    return new Promise(async (resolve, reject) => {
        const { email } = userInfo
        try {
            const checkUser = await User.findOne({
                email: email,
            })
            if (checkUser === null) {
                resolve({
                    status: "OK",
                    message: "User not found!"
                })
            }

            const token = await genToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin,
            })

            await PasswordResetToken.create({
                userId: checkUser.id,
                token: token,
                expiresAt: Date.now() + 5 * 60 * 1000,
            })


            await EmailService.recoveryPassword({ email, token })


            resolve({
                status: "OK",
                message:
                    "Password recovery email sent!",
                data: {
                    email: checkUser.email,
                    token: token,
                },
            });
        } catch (e) {
            reject(e);
        }
    })
}

const resetPassword = async (token, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resetToken = await PasswordResetToken.findOne({ token });

            if (!resetToken) {
                return { success: false, message: 'Invalid Token!' };
            }

            if (resetToken.used) {
                return { success: false, message: 'Token has already been used!' };
            }

            if (resetToken.expiresAt < Date.now()) {
                return { success: false, message: 'Token has expired!' };
            }

            const user = await User.findById(resetToken.userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Update password
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            user.password = hashedPassword;
            await user.save();


            // Mark token as used
            resetToken.used = true;
            await resetToken.save();
            resolve({ 
                status: "OK",
                message: "Password reset successfully!",
                success: true 
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    registerAccount,
    loginAccount,
    verifyAccount,
    forgotPassword,
    resetPassword
};