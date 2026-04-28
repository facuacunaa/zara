const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")
require("dotenv").config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Imágenes ───────────────────────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:          "zara-artists/images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation:  [{ quality: "auto", fetch_format: "auto" }],
    },
})

// ── Videos ────────────────────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:          "zara-artists/videos",
        resource_type:   "video",
        allowed_formats: ["mp4", "mov", "webm"],
    },
})

const upload      = multer({ storage: imageStorage, limits: { fileSize: 10  * 1024 * 1024 } }) // 10MB
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 200 * 1024 * 1024 } }) // 200MB

module.exports = { cloudinary, upload, uploadVideo }
