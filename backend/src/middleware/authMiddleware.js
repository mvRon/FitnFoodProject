const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleWare = (req, res, next) => {
    try {
        const token = req.headers.token.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                return res.status(404).json({ message: "The authentication", status: "ERROR" });
            }
            if (user?.isAdmin) {
                next();
            } else {
                return res.status(404).json({ message: "The authentication", status: "ERROR" });
            }
        });
    } catch (e) {
        return res.status(401).json({
            message: "Token required!"
        })
    }

};

const authUserMiddleWare = (req, res, next) => {
    try {
        const token = req.headers.token?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided", status: "ERROR" });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                return res.status(403).json({ message: "Invalid token", status: "ERROR" });
            }

            // Gán user vào req để controller có thể dùng
            req.user = user;

            // Cho qua nếu token hợp lệ
            next();
        });
    } catch (e) {
        return res.status(401).json({
            message: "Token required!"


        })
    }

};


module.exports = { authMiddleWare, authUserMiddleWare };