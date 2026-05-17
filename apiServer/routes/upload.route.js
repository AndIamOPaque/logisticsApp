import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "logisticsApp",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Mock auth middleware - you should replace this with your actual auth middleware
// import { protect } from "../middlewares/auth.middleware.js";

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Cloudinary returns the secure URL in req.file.path
    const fileUrl = req.file.path;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        fileType: req.file.mimetype ? (req.file.mimetype.startsWith("image/") ? "image" : "pdf") : "file",
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
