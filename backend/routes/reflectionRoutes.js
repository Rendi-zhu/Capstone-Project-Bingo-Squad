const express = require("express");
const router = express.Router();

const {
  getAllReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  submitReflection
} = require("../controllers/reflectionController");

// GET all reflections
router.get("/", getAllReflections);

// GET one reflection
router.get("/:id", getReflectionById);

// CREATE reflection
router.post("/", createReflection);

// UPDATE reflection / save draft
router.put("/:id", updateReflection);

// SUBMIT reflection
router.put("/:id/submit", submitReflection);

module.exports = router;