const mongoose = require("mongoose")

const hotspotSchema = new mongoose.Schema({
    x:     { type: Number, required: true },
    y:     { type: Number, required: true },
    name:  { type: String, required: true },
    price: { type: String, required: true },
}, { _id: false })

const shopProductSchema = new mongoose.Schema({
    image: { type: String, default: "" },
    name:  { type: String, default: "" },
    price: { type: String, default: "" },
    // _id: true (default) — cada producto tiene su propio ObjectId para la ruta de detalle
})

const artistSchema = mongoose.Schema({
    name:     { type: String, required: true },
    slug:     { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ── HERO ──────────────────────────────────────────────────────────────
    heroVideo:  { type: String, default: "" },
    subtitle:   { type: String, default: "COLECCIÓN EXCLUSIVA · 2024" },

    // ── SECCIÓN 2: Editorial statement ────────────────────────────────────
    editorialLabel:       { type: String, default: "— La colección" },
    editorialQuote:       { type: String, default: "" },
    editorialDescription: { type: String, default: "" },

    // ── SECCIÓN 3: Grid asimétrico I (texto) ──────────────────────────────
    section1Label:    { type: String, default: "01 / Estructura" },
    section1Headline: { type: String, default: "" },
    section1Body:     { type: String, default: "" },

    // ── SECCIÓN 4: Full width + pullquote ─────────────────────────────────
    section2Label: { type: String, default: "02 / Movimiento" },
    section2Quote: { type: String, default: "" },

    // ── SECCIÓN 6: Shop the Look ──────────────────────────────────────────
    shopImage:       { type: String, default: "" },
    shopTitle:       { type: String, default: "" },
    shopDescription: { type: String, default: "" },
    hotspots:        [hotspotSchema],
    shopProducts:    [shopProductSchema],

    // ── SECCIÓN 7: Landscape quote ────────────────────────────────────────
    landscapeQuote: { type: String, default: "" },

    // ── FOOTER ────────────────────────────────────────────────────────────
    footerLabel: { type: String, default: "" },
    footerWord:  { type: String, default: "Fin." },

    // ── IMÁGENES (galería en orden de aparición) ──────────────────────────
    // [0]=grid1-izq  [1]=grid1-der  [2]=wide1  [3]=wide2  [4]=grid2-der  [5]=landscape
    images: [{ type: String }],

}, { timestamps: true })

const ArtistModel = mongoose.model("artist", artistSchema)
module.exports = { ArtistModel }
