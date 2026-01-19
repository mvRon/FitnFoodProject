const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { response } = require("express");


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

            // Create new user
            const user = await User.create({
                name: newAccount.name,
                email: newAccount.email,
                password: hashedPassword,
                phone: newAccount.phone,
                address: newAccount.address,
                city: newAccount.city
            });
            if (user) {
                return resolve({
                    status: "OK",
                    message: "Registration successful!"
                });
            }
        } catch (error) {
            return reject(error);
        }
    })
}

const login = async (loginData) => {
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

            return resolve({
                status: "OK",
                message: "Login successful!",
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    registerAccount,
    login
};