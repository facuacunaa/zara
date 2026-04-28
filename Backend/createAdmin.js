require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { UserModel } = require('./models/User.model')

// Conexión directa sin SRV (evita el problema de DNS local)
const DIRECT_URL = 'mongodb://renserustx_db_user:Admin1234@ac-evf9pyu-shard-00-00.im6udwy.mongodb.net:27017,ac-evf9pyu-shard-00-01.im6udwy.mongodb.net:27017,ac-evf9pyu-shard-00-02.im6udwy.mongodb.net:27017/zara?ssl=true&authSource=admin&replicaSet=atlas-4s9zlx-shard-0&retryWrites=true&w=majority'

async function createAdmin() {
    console.log('Conectando a MongoDB...')
    await mongoose.connect(DIRECT_URL)
    console.log('Conectado!')

    const existing = await UserModel.findOne({ email: 'facuagustin17@gmail.com' })
    if (existing) {
        await UserModel.findByIdAndUpdate(existing._id, { isAdmin: true })
        console.log('✅ Usuario admin actualizado correctamente')
    } else {
        const hash = await bcrypt.hash('Facu40177800', 10)
        await new UserModel({
            email: 'facuagustin17@gmail.com',
            password: hash,
            name: 'Admin',
            isAdmin: true
        }).save()
        console.log('✅ Usuario admin creado correctamente')
    }

    await mongoose.disconnect()
    process.exit(0)
}

createAdmin().catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
})
