const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { connectDB } = require("../config/db")
const { UserModel } = require("../models/User.model")
const { ProductModel } = require("../models/Product.model")
const { adminAuth } = require("../middlewares/adminAuth")
const { ArtistModel } = require("../models/Artist.model")

const adminRouter = express.Router()

// Garantiza conexión en cada request (necesario en serverless)
adminRouter.use(async (req, res, next) => {
    await connectDB()
    next()
})

// ── SETUP: crea el usuario admin una sola vez ──────────────────────────────
adminRouter.post("/setup", async (req, res) => {
    try {
        const existing = await UserModel.findOne({ email: "facuagustin17@gmail.com" })
        if (existing) {
            // Si ya existe, solo asegurarse de que sea admin
            await UserModel.findByIdAndUpdate(existing._id, { isAdmin: true })
            return res.json({ msg: "Admin user updated successfully" })
        }
        const hash = await bcrypt.hash("Facu40177800", 10)
        const admin = new UserModel({
            email: "facuagustin17@gmail.com",
            password: hash,
            name: "Admin",
            isAdmin: true
        })
        await admin.save()
        res.json({ msg: "Admin user created successfully" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Error creating admin", error: err.message })
    }
})

// ── LOGIN ADMIN ────────────────────────────────────────────────────────────
adminRouter.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (!user || !user.isAdmin) return res.status(403).json({ msg: "Access denied" })
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ msg: "Invalid credentials" })
        const token = jwt.sign({ userID: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.json({ msg: "Login successful", token })
    } catch (err) {
        res.status(500).json({ msg: "Server error" })
    }
})

// ── OBTENER TODOS LOS PRODUCTOS ────────────────────────────────────────────
adminRouter.get("/products", adminAuth, async (req, res) => {
    try {
        const products = await ProductModel.find()
        res.json(products)
    } catch (err) {
        res.status(500).json({ msg: "Error fetching products" })
    }
})

// ── CREAR PRODUCTO ─────────────────────────────────────────────────────────
adminRouter.post("/products", adminAuth, async (req, res) => {
    try {
        const product = new ProductModel(req.body)
        await product.save()
        res.json({ msg: "Product created", product })
    } catch (err) {
        res.status(500).json({ msg: "Error creating product" })
    }
})

// ── EDITAR PRODUCTO ────────────────────────────────────────────────────────
adminRouter.put("/products/:id", adminAuth, async (req, res) => {
    try {
        const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json({ msg: "Product updated", product: updated })
    } catch (err) {
        res.status(500).json({ msg: "Error updating product" })
    }
})

// ── ELIMINAR PRODUCTO ──────────────────────────────────────────────────────
adminRouter.delete("/products/:id", adminAuth, async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.id)
        res.json({ msg: "Product deleted" })
    } catch (err) {
        res.status(500).json({ msg: "Error deleting product" })
    }
})

// ── LISTAR ARTISTAS (admin) ────────────────────────────────────────────────
adminRouter.get("/artists", adminAuth, async (req, res) => {
    try {
        const artists = await ArtistModel.find({}).select("-password").lean()
        res.json(artists)
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── CAMBIAR CONTRASEÑA DE ARTISTA (admin) ──────────────────────────────────
adminRouter.put("/artists/:id/password", adminAuth, async (req, res) => {
    const { password } = req.body
    if (!password || password.length < 4)
        return res.status(400).json({ msg: "La contraseña debe tener al menos 4 caracteres" })
    try {
        const hash = await bcrypt.hash(password, 10)
        await ArtistModel.findByIdAndUpdate(req.params.id, { password: hash })
        res.json({ msg: "Contraseña actualizada" })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

module.exports = { adminRouter }
