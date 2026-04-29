const mongoose = require("mongoose")

const settingsSchema = new mongoose.Schema({
    key:        { type: String, default: "homepage", unique: true },
    heroVideo:  { type: String, default: "" },  // video del home
}, { timestamps: true })

const SettingsModel = mongoose.model("Settings", settingsSchema)

module.exports = { SettingsModel }
