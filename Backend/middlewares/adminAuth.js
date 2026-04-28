const jwt = require("jsonwebtoken")
require('dotenv').config()

const adminAuth = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({ msg: "No token provided" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.isAdmin) return res.status(403).json({ msg: "Admin access only" })
        req.adminID = decoded.userID
        next()
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" })
    }
}

module.exports = { adminAuth }
