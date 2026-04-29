const express    = require("express")
const bcrypt     = require("bcrypt")
const jwt        = require("jsonwebtoken")
require("dotenv").config()
const { connectDB }   = require("../config/db")
const { ArtistModel } = require("../models/Artist.model")
const { upload, uploadVideo } = require("../config/cloudinary")

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
        res.json({ msg: "Login exitoso", token, artist: { ...artist.toObject(), password: undefined } })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── LISTAR TODOS LOS ARTISTAS (público) ───────────────────────────────────
artistRouter.get("/", async (req, res) => {
    try {
        const artists = await ArtistModel.find({}).select("name slug").lean()
        res.json(artists)
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

// ── ACTUALIZAR TEXTOS (artista autenticado) ────────────────────────────────
artistRouter.put("/content/update", artistAuth, async (req, res) => {
    const {
        subtitle,
        editorialLabel, editorialQuote, editorialDescription,
        section1Label,  section1Headline, section1Body,
        section2Label,  section2Quote,
        shopTitle,      shopDescription,
        landscapeQuote,
        footerLabel,    footerWord,
    } = req.body
    try {
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            {
                subtitle,
                editorialLabel, editorialQuote, editorialDescription,
                section1Label,  section1Headline, section1Body,
                section2Label,  section2Quote,
                shopTitle,      shopDescription,
                landscapeQuote,
                footerLabel,    footerWord,
            },
            { new: true }
        ).select("-password")
        res.json({ msg: "Contenido actualizado", artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── SUBIR VIDEO HERO ───────────────────────────────────────────────────────
artistRouter.post("/video/upload", artistAuth, uploadVideo.single("video"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió video" })
        const url    = req.file.path
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { heroVideo: url },
            { new: true }
        ).select("-password")
        res.json({ msg: "Video subido", url, artist })
    } catch (err) {
        res.status(500).json({ msg: "Error subiendo video", error: err.message })
    }
})

// ── SUBIR IMAGEN A SLOT ESPECÍFICO (0-5) ──────────────────────────────────
artistRouter.post("/images/slot/:slot", artistAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const slot = parseInt(req.params.slot)
        if (isNaN(slot) || slot < 0 || slot > 5)
            return res.status(400).json({ msg: "Slot inválido (0-5)" })

        const url    = req.file.path
        const artist = await ArtistModel.findById(req.artistId)
        if (!artist) return res.status(404).json({ msg: "Artista no encontrado" })

        // Rellenar con vacíos hasta el slot pedido
        while (artist.images.length <= slot) artist.images.push("")
        artist.images[slot] = url
        artist.markModified("images")
        await artist.save()

        const updated = await ArtistModel.findById(req.artistId).select("-password")
        res.json({ msg: "Imagen actualizada", url, images: updated.images })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── SUBIR IMAGEN SHOP THE LOOK ─────────────────────────────────────────────
artistRouter.post("/images/shop", artistAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const url    = req.file.path
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { shopImage: url },
            { new: true }
        ).select("-password")
        res.json({ msg: "Shop image actualizada", url, artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── GUARDAR HOTSPOTS ───────────────────────────────────────────────────────
artistRouter.put("/hotspots", artistAuth, async (req, res) => {
    const { hotspots } = req.body
    if (!Array.isArray(hotspots))
        return res.status(400).json({ msg: "hotspots debe ser un array" })
    // Validar cada hotspot
    for (const h of hotspots) {
        if (typeof h.x !== "number" || typeof h.y !== "number" ||
            typeof h.name !== "string" || typeof h.price !== "string")
            return res.status(400).json({ msg: "Cada hotspot necesita x, y, name, price" })
    }
    try {
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { hotspots },
            { new: true }
        ).select("-password")
        res.json({ msg: "Hotspots actualizados", artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── AGREGAR PRODUCTO AL SHOP THE LOOK ─────────────────────────────────────
artistRouter.post("/shop-products", artistAuth, upload.single("image"), async (req, res) => {
    try {
        const { name, price } = req.body
        if (!name || !price) return res.status(400).json({ msg: "Nombre y precio requeridos" })
        const image = req.file ? req.file.path : ""
        const artist = await ArtistModel.findByIdAndUpdate(
            req.artistId,
            { $push: { shopProducts: { image, name, price } } },
            { new: true }
        ).select("-password")
        res.json({ msg: "Producto agregado", artist })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── ELIMINAR PRODUCTO DEL SHOP THE LOOK ───────────────────────────────────
artistRouter.delete("/shop-products/:index", artistAuth, async (req, res) => {
    try {
        const artist = await ArtistModel.findById(req.artistId)
        const idx = parseInt(req.params.index)
        if (isNaN(idx) || idx < 0 || idx >= artist.shopProducts.length)
            return res.status(400).json({ msg: "Índice inválido" })
        artist.shopProducts.splice(idx, 1)
        artist.markModified("shopProducts")
        await artist.save()
        const updated = await ArtistModel.findById(req.artistId).select("-password")
        res.json({ msg: "Producto eliminado", artist: updated })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── SUBIR IMAGEN (push al array legacy) ───────────────────────────────────
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

// ── ELIMINAR IMAGEN ────────────────────────────────────────────────────────
artistRouter.delete("/images/:index", artistAuth, async (req, res) => {
    try {
        const artist = await ArtistModel.findById(req.artistId)
        const idx    = parseInt(req.params.index)
        if (idx < 0 || idx >= artist.images.length)
            return res.status(400).json({ msg: "Índice inválido" })
        artist.images.splice(idx, 1)
        artist.markModified("images")
        await artist.save()
        res.json({ msg: "Imagen eliminada", images: artist.images })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

module.exports = { artistRouter }
