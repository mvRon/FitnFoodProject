const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const genToken = (payload) => {
    const accessToken = jwt.sign({
        ...payload,
    }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
    return accessToken;
}

const refresh_genToken = (payload) => {
    const refreshToken = jwt.sign({
        ...payload,
    }, process.env.REFRESH_TOKEN, { expiresIn: '7d' })
    return refreshToken;
}

const refreshToken = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    return resolve({
                        status: "ERR",
                        message: "The authentication - hết hạn"
                    })
                }
                const access_token = await genToken({
                    id: user.id,
                    isAdmin: user.isAdmin
                })
                return resolve({
                    status: "OK",
                    message: "SUCCESS",
                    access_token
                })
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    genToken,
    refresh_genToken,
    refreshToken
}