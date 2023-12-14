module.exports = {
    jwt: {
        secret: process.env.AUTH_SECREAT || "default",
        expiresIn: "1d"
    }
}