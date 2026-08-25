const db = require("../config/db");

// CREATE self assessment
const createSelfAssessment = (req, res) => {
  const {
    reflection_id,
    contribution,
    communication,
    collaboration,
    critical_thinking,
    problem_solving
  } = req.body;

  const scores = [
    contribution,
    communication,
    collaboration,
    critical_thinking,
    problem_solving
  ];

  const invalidScore = scores.some(
    (score) => score < 1 || score > 5 || !Number.isInteger(score)
  );

  if (!reflection_id) {
    return res.status(400).json({
      message: "reflection_id is required"
    });
  }

  if (invalidScore) {
    return res.status(400).json({
      message: "All assessment scores must be integers between 1 and 5"
    });
  }

  const checkSql =
    "SELECT * FROM self_assessments WHERE reflection_id = ?";

  db.query(checkSql, [reflection_id], (checkErr, existing) => {
    if (checkErr) {
      console.error("Error checking self assessment:", checkErr);

      return res.status(500).json({
        message: "Failed to check self assessment"
      });
    }

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Self assessment already exists for this reflection"
      });
    }

    const sql = `
      INSERT INTO self_assessments
      (
        reflection_id,
        contribution,
        communication,
        collaboration,
        critical_thinking,
        problem_solving
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        reflection_id,
        contribution,
        communication,
        collaboration,
        critical_thinking,
        problem_solving
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating self assessment:", err);

          return res.status(500).json({
            message: "Failed to create self assessment"
          });
        }

        res.status(201).json({
          message: "Self assessment created successfully",
          selfAssessmentId: result.insertId
        });
      }
    );
  });
};

// GET self assessment by reflection ID
const getSelfAssessmentByReflectionId = (req, res) => {
  const { reflectionId } = req.params;

  const sql =
    "SELECT * FROM self_assessments WHERE reflection_id = ?";

  db.query(sql, [reflectionId], (err, results) => {
    if (err) {
      console.error("Error fetching self assessment:", err);

      return res.status(500).json({
        message: "Failed to fetch self assessment"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Self assessment not found"
      });
    }

    res.json(results[0]);
  });
};

// UPDATE self assessment
const updateSelfAssessment = (req, res) => {
  const { reflectionId } = req.params;

  const {
    contribution,
    communication,
    collaboration,
    critical_thinking,
    problem_solving
  } = req.body;

  const scores = [
    contribution,
    communication,
    collaboration,
    critical_thinking,
    problem_solving
  ];

  const invalidScore = scores.some(
    (score) => score < 1 || score > 5 || !Number.isInteger(score)
  );

  if (invalidScore) {
    return res.status(400).json({
      message: "All assessment scores must be integers between 1 and 5"
    });
  }

  const sql = `
    UPDATE self_assessments
    SET
      contribution = ?,
      communication = ?,
      collaboration = ?,
      critical_thinking = ?,
      problem_solving = ?
    WHERE reflection_id = ?
  `;

  db.query(
    sql,
    [
      contribution,
      communication,
      collaboration,
      critical_thinking,
      problem_solving,
      reflectionId
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating self assessment:", err);

        return res.status(500).json({
          message: "Failed to update self assessment"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Self assessment not found"
        });
      }

      res.json({
        message: "Self assessment updated successfully"
      });
    }
  );
};

module.exports = {
  createSelfAssessment,
  getSelfAssessmentByReflectionId,
  updateSelfAssessment
};