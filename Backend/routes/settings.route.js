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

// ── GUARDAR TEXTO SOBRE EL VIDEO HERO (solo admin) ───────────────────────
settingsRouter.put("/hero-video-text", adminAuth, async (req, res) => {
    const { heroVideoText } = req.body
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: { heroVideoText: heroVideoText || "" } },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Texto actualizado", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── ELIMINAR VIDEO HERO DEL HOME (solo admin) ────────────────────────────
settingsRouter.delete("/home-video", adminAuth, async (req, res) => {
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { heroVideo: "" },
            { new: true, upsert: true }
        )
        res.json({ msg: "Video eliminado", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error eliminando video", error: err.message })
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

// ── CARRUSEL DE INICIO: subir imagen por slot (1-4) ──────────────────────
settingsRouter.post("/carousel-image/:slot", adminAuth, async (req, res) => {
    const slot = req.params.slot
    if (!['1','2','3','4'].includes(slot)) return res.status(400).json({ msg: "Slot inválido" })
    const { upload } = require("../config/cloudinary")
    upload.single("image")(req, res, async (err) => {
        if (err) return res.status(500).json({ msg: "Error subiendo imagen", error: err.message })
        if (!req.file) return res.status(400).json({ msg: "No se envió imagen" })
        const url = req.file.path
        const field = `carouselImage${slot}`
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

// ── CARRUSEL DE INICIO: eliminar imagen por slot ──────────────────────────
settingsRouter.delete("/carousel-image/:slot", adminAuth, async (req, res) => {
    const slot = req.params.slot
    if (!['1','2','3','4'].includes(slot)) return res.status(400).json({ msg: "Slot inválido" })
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: { [`carouselImage${slot}`]: "" } },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Imagen eliminada", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── GUARDAR TEXTOS DEL CARRUSEL (solo admin) ─────────────────────────────
settingsRouter.put("/carousel-texts", adminAuth, async (req, res) => {
    const fields = {}
    ;[1,2,3,4].forEach(n => {
        fields[`carouselTitle${n}`] = req.body[`carouselTitle${n}`] || ''
        fields[`carouselSub${n}`]   = req.body[`carouselSub${n}`]   || ''
    })
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: fields },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Textos del carrusel guardados", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── GUARDAR MISIÓN / MANIFIESTO (solo admin) ─────────────────────────────
settingsRouter.put("/mission", adminAuth, async (req, res) => {
    const { missionEyebrow, missionTitle, missionBody, missionCta, missionCtaLink } = req.body
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: { missionEyebrow, missionTitle, missionBody, missionCta, missionCtaLink } },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Misión guardada", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

// ── GUARDAR BANNER (solo admin) ───────────────────────────────────────────
settingsRouter.put("/banner", adminAuth, async (req, res) => {
    const { bannerText, bannerLink, bannerBg, bannerColor, bannerActive } = req.body
    try {
        const settings = await SettingsModel.findOneAndUpdate(
            { key: "homepage" },
            { $set: { bannerText, bannerLink, bannerBg, bannerColor, bannerActive } },
            { new: true, upsert: true, strict: false }
        )
        res.json({ msg: "Banner actualizado", settings })
    } catch (err) {
        res.status(500).json({ msg: "Error", error: err.message })
    }
})

module.exports = { settingsRouter }
