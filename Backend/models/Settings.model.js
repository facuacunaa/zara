const mongoose = require("mongoose")

const settingsSchema = new mongoose.Schema({
    key:        { type: String, default: "homepage", unique: true },
    heroVideo:  { type: String, default: "" },

    // ── SECCIÓN EDITORIAL ─────────────────────────────────────────────────
    editorialLabel:  { type: String, default: "" },  // etiqueta pequeña
    editorialQuote:  { type: String, default: "" },  // frase grande itálica
    editorialBody:   { type: String, default: "" },  // párrafo de apoyo
    editorialCta:    { type: String, default: "" },  // botón / llamada a acción
}, { timestamps: true, strict: false })

const SettingsModel = mongoose.model("Settings", settingsSchema)

module.exports = { SettingsModel }
