const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const {
  createEvidence,
  getEvidenceByReflectionId,
  deleteEvidence
} = require("../controllers/evidenceController");

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG and PNG files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Upload real evidence file
router.post(
  "/upload",
  upload.single("file"),
  createEvidence
);

// Existing metadata route
router.post("/", createEvidence);

// Get evidence for reflection
router.get(
  "/reflection/:reflectionId",
  getEvidenceByReflectionId
);

// Delete evidence
router.delete("/:id", deleteEvidence);

module.exports = router;