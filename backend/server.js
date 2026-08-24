const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const reflectionRoutes = require("./routes/reflectionRoutes");
const selfAssessmentRoutes = require("./routes/selfAssessmentRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Bingo Squad Backend is running!"
  });
});

// API routes
app.use("/api/reflections", reflectionRoutes);
app.use("/api/self-assessments", selfAssessmentRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/assessments", assessmentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});