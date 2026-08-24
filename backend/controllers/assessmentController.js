const db = require("../config/db");

// CREATE assessment
const createAssessment = (req, res) => {
  const {
    reflection_id,
    assessor_score,
    feedback
  } = req.body;

  if (!reflection_id) {
    return res.status(400).json({
      message: "reflection_id is required"
    });
  }

  const checkSql =
    "SELECT * FROM assessments WHERE reflection_id = ?";

  db.query(checkSql, [reflection_id], (checkErr, existing) => {
    if (checkErr) {
      console.error("Error checking assessment:", checkErr);

      return res.status(500).json({
        message: "Failed to check assessment"
      });
    }

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Assessment already exists for this reflection"
      });
    }

    const sql = `
      INSERT INTO assessments
      (
        reflection_id,
        assessor_score,
        feedback
      )
      VALUES (?, ?, ?)
    `;

    db.query(
      sql,
      [
        reflection_id,
        assessor_score || null,
        feedback || null
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating assessment:", err);

          return res.status(500).json({
            message: "Failed to create assessment"
          });
        }

        res.status(201).json({
          message: "Assessment created successfully",
          assessmentId: result.insertId
        });
      }
    );
  });
};

// GET assessment by reflection ID
const getAssessmentByReflectionId = (req, res) => {
  const { reflectionId } = req.params;

  const sql =
    "SELECT * FROM assessments WHERE reflection_id = ?";

  db.query(sql, [reflectionId], (err, results) => {
    if (err) {
      console.error("Error fetching assessment:", err);

      return res.status(500).json({
        message: "Failed to fetch assessment"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Assessment not found"
      });
    }

    res.json(results[0]);
  });
};

// UPDATE assessment
const updateAssessment = (req, res) => {
  const { reflectionId } = req.params;

  const {
    assessor_score,
    feedback
  } = req.body;

  const sql = `
    UPDATE assessments
    SET
      assessor_score = ?,
      feedback = ?
    WHERE reflection_id = ?
  `;

  db.query(
    sql,
    [
      assessor_score || null,
      feedback || null,
      reflectionId
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating assessment:", err);

        return res.status(500).json({
          message: "Failed to update assessment"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Assessment not found"
        });
      }

      res.json({
        message: "Assessment updated successfully"
      });
    }
  );
};

module.exports = {
  createAssessment,
  getAssessmentByReflectionId,
  updateAssessment
};