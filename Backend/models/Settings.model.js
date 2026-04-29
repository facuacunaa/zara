const mongoose = require("mongoose")

const settingsSchema = new mongoose.Schema({
    key:        { type: String, default: "homepage", unique: true },
    heroVideo:  { type: String, default: "" },

    // ── SECCIÓN EDITORIAL ─────────────────────────────────────────────────
    editorialLabel:  { type: String, default: "" },
    editorialQuote:  { type: String, default: "" },
    editorialBody:   { type: String, default: "" },
    editorialCta:    { type: String, default: "" },
    editorialImage1: { type: String, default: "" },  // imagen izquierda
    editorialImage2: { type: String, default: "" },  // imagen derecha
}, { timestamps: true, strict: false })

const SettingsModel = mongoose.model("Settings", settingsSchema)

module.exports = { SettingsModel }
