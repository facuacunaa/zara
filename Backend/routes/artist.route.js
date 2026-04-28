const express    = require("express")
const bcrypt     = require("bcrypt")
const jwt        = require("jsonwebtoken")
require("dotenv").config()
const { connectDB }   = require("../config/db")
const { ArtistModel } = require("../models/Artist.model")
const { upload }      = require("../config/cloudinary")

const artistRouter = express.Router()

// Garantiza conexión en cada request
artistRouter.use(async (req, res, next) => {
    await connectDB()
    next()
})

// ── Middleware auth artista ────────────────────────────────────────────────
const artistAuth = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({ msg: "Sin token" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.artistSlug) return res.status(403).json({ msg: "No es artista" })
        req.artistSlug = decoded.artistSlug
        req.artistId   = decoded.artistId
        next()
    } catch {
        res.status(401).json({ msg: "Token inválido" })
    }
}

// ── CREAR ARTISTA (solo admin) ─────────────────────────────────────────────
artistRouter.post("/create", async (req, res) => {
    const { name, slug, email, password } = req.body
    try {
        const exists = await ArtistModel.findOne({ $or: [{ email }, { slug }] })
        if (exists) return res.status(400).json({ msg: "Email o slug ya existe" })
        const hash   = await bcrypt.hash(password, 10)
        const artist = new ArtistModel({ name, slug, email, password: hash })
        await artist.save()
        res.json({ msg: "Artista creado", artist: { name, slug, email } })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── LOGIN ARTISTA ──────────────────────────────────────────────────────────
artistRouter.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const artist = await ArtistModel.findOne({ email })
        if (!artist) return res.status(404).json({ msg: "Artista no encontrado" })
        const match  = await bcrypt.compare(password, artist.password)
        if (!match)  return res.status(401).json({ msg: "Contraseña incorrecta" })
        const token  = jwt.sign(
            { artistId: artist._id, artistSlug: artist.slug },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )
        res.json({ msg: "Login exitoso", token, artist: {
            name: artist.name, slug: artist.slug, email: artist.email,
            heroVideo: artist.heroVideo, heroImage: artist.heroImage,
            images: artist.images, description: artist.description,
            subtitle: artist.subtitle, quote: artist.quote,
        }})
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── OBTENER ARTISTA (público) ──────────────────────────────────────────────
artistRouter.get("/:slug", async (req, res) => {
    try {
        const artist = await ArtistModel.findOne({ slug: req.params.slug }).select("-password")
        if (!artist) return res.status(404).json({ msg: "Artista no encontrado" })
        res.json(artist)
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── ACTUALIZAR INFO (artista autenticado) ──────────────────────────────────
artistRouter.put("/content/update", artistAuth, async (req, res) => {
    const { heroVideo, description, subtitle, quote } = req.body
    try {
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { heroVideo, description, subtitle, quote },
            { new: true }
        ).select("-password")
        res.json({ msg: "Contenido actualizado", artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── SUBIR IMAGEN ───────────────────────────────────────────────────────────
artistRouter.post("/images/upload", artistAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const url    = req.file.path
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { $push: { images: url } },
            { new: true }
        ).select("-password")
        res.json({ msg: "Imagen subida", url, images: artist.images })
    } catch (err) {
        res.status(500).json({ msg: "Error subiendo imagen", error: err.message })
    }
})

// ── SUBIR IMAGEN HERO ──────────────────────────────────────────────────────
artistRouter.post("/images/hero", artistAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const url    = req.file.path
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { heroImage: url },
            { new: true }
        ).select("-password")
        res.json({ msg: "Hero actualizado", url, artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── ELIMINAR IMAGEN ────────────────────────────────────────────────────────
artistRouter.delete("/images/:index", artistAuth, async (req, res) => {
    try {
        const artist = await ArtistModel.findById(req.artistId)
        const idx    = parseInt(req.params.index)
        if (idx < 0 || idx >= artist.images.length)
            return res.status(400).json({ msg: "Índice inválido" })
        artist.images.splice(idx, 1)
        await artist.save()
        res.json({ msg: "Imagen eliminada", images: artist.images })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

module.exports = { artistRouter }
