const mongoose = require("mongoose")

let isConnected = false

const connectDB = async () => {
    if (isConnected) return
    await mongoose.connect(process.env.mongo_url)
    isConnected = true
}

// Conexión inicial para compatibilidad con el código existente
const connection = connectDB()

module.exports = { connection, connectDB }