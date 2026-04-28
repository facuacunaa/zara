const mongoose = require("mongoose")

let cached = global.mongoose || { conn: null, promise: null }
global.mongoose = cached

const connectDB = async () => {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.mongo_url, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
        }).then(m => m)
    }

    cached.conn = await cached.promise
    return cached.conn
}

// Conexión inicial para compatibilidad con el código existente
const connection = connectDB()

module.exports = { connection, connectDB }