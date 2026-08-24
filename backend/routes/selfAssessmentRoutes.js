const express = require("express");
const router = express.Router();

const {
  createSelfAssessment,
  getSelfAssessmentByReflectionId,
  updateSelfAssessment
} = require("../controllers/selfAssessmentController");

router.post("/", createSelfAssessment);

router.get(
  "/:reflectionId",
  getSelfAssessmentByReflectionId
);

router.put(
  "/:reflectionId",
  updateSelfAssessment
);

module.exports = router;