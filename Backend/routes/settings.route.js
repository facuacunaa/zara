const express = require("express")
require("dotenv").config()
const { connectDB }      = require("../config/db")
const { SettingsModel }  = require("../models/Settings.model")
const { uploadVideo }    = require("../config/cloudinary")
const { adminAuth }      = require("../middlewares/adminAuth")

const settingsRouter = express.Router()

settingsRouter.use(async (req, res, next) => {
    await connectDB()
    next()
})

// ── GET settings (público) ────────────────────────────────────────────────
settingsRouter.get("/", async (req, res) => {
    try {
        let settings = await SettingsModel.findOne({ key: "homepage" })
        if (!settings) settings = await SettingsModel.create({ key: "homepage" })
        res.json(settings)
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── SUBIR VIDEO HERO DEL HOME (solo admin) ────────────────────────────────
settingsRouter.post("/home-video", adminAuth, uploadVideo.single("video"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No se envió video" })
        const url = req.file.path
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { heroVideo: url },
            { new: true, upsert: true }
        )
        res.json({ msg: "Video subido", url, settings })
    } catch (err) {
        res.status(500).json({ msg: "Error subiendo video", error: err.message })
    }
})

// ── SUBIR IMAGEN EDITORIAL (solo admin) ──────────────────────────────────
settingsRouter.post("/editorial-image/:slot", adminAuth, async (req, res) => {
    const slot = req.params.slot // '1' o '2'
    if (!['1','2'].includes(slot)) return res.status(400).json({ msg: "Slot inválido" })
    const { upload } = require("../config/cloudinary")
    upload.single("image")(req, res, async (err) => {
        if (err) return res.status(500).json({ msg: "Error subiendo imagen", error: err.message })
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const url = req.file.path
        const field = `editorialImage${slot}`
        try {
            const settings = await SettingsModel.findOneAndUpdate(
                { key: "homepage" },
                { $set: { [field]: url } },
                { new: true, upsert: true, strict: false }
            )
            res.json({ msg: "Imagen subida", url, settings })
        } catch (e) {
            res.status(500).json({ msg: "Error guardando", error: e.message })
        }
    })
})

// ── GUARDAR TEXTOS EDITORIALES (solo admin) ───────────────────────────────
settingsRouter.put("/editorial", adminAuth, async (req, res) => {
    const { editorialLabel, editorialQuote, editorialBody, editorialCta } = req.body
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: { editorialLabel, editorialQuote, editorialBody, editorialCta } },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Editorial actualizada", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

module.exports = { settingsRouter }
