const mongoose = require("mongoose")

const artistSchema = mongoose.Schema({
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    heroVideo:   { type: String, default: "" },
    heroImage:   { type: String, default: "" },
    images:      [{ type: String }],
    description: { type: String, default: "" },
    subtitle:    { type: String, default: "COLECCIÓN EXCLUSIVA" },
    quote:       { type: String, default: "" },
}, { timestamps: true })

const ArtistModel = mongoose.model("artist", artistSchema)
module.exports = { ArtistModel }
