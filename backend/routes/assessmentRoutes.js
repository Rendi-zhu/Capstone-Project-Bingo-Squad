const express = require("express");
const router = express.Router();

const {
  createAssessment,
  getAssessmentByReflectionId,
  updateAssessment
} = require("../controllers/assessmentController");

router.post("/", createAssessment);

router.get(
  "/:reflectionId",
  getAssessmentByReflectionId
);

router.put(
  "/:reflectionId",
  updateAssessment
);

module.exports = router;