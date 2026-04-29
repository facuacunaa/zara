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

module.exports = { settingsRouter }
