const db = require("../config/db");

// GET all reflections
const getAllReflections = (req, res) => {
  const sql = "SELECT * FROM reflections ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching reflections:", err);

      return res.status(500).json({
        message: "Failed to fetch reflections"
      });
    }

    res.json(results);
  });
};

// GET one reflection by ID
const getReflectionById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM reflections WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching reflection:", err);

      return res.status(500).json({
        message: "Failed to fetch reflection"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Reflection not found"
      });
    }

    res.json(results[0]);
  });
};

// CREATE a new reflection
const createReflection = (req, res) => {
  const {
    user_id,
    title,
    project_group,
    reflection_date,
    worked_on,
    challenges,
    learned,
    improvement,
    status
  } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const sql = `
    INSERT INTO reflections
    (
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      status || "draft"
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating reflection:", err);

        return res.status(500).json({
          message: "Failed to create reflection"
        });
      }

      res.status(201).json({
        message: "Reflection created successfully",
        reflectionId: result.insertId
      });
    }
  );
};

// UPDATE an existing reflection
const updateReflection = (req, res) => {
  const { id } = req.params;

  const {
    user_id,
    title,
    project_group,
    reflection_date,
    worked_on,
    challenges,
    learned,
    improvement,
    status
  } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const sql = `
    UPDATE reflections
    SET
      user_id = ?,
      title = ?,
      project_group = ?,
      reflection_date = ?,
      worked_on = ?,
      challenges = ?,
      learned = ?,
      improvement = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      status || "draft",
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating reflection:", err);

        return res.status(500).json({
          message: "Failed to update reflection"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Reflection not found"
        });
      }

      res.json({
        message: "Reflection updated successfully"
      });
    }
  );
};

// SUBMIT a reflection
const submitReflection = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE reflections
    SET status = 'submitted'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error submitting reflection:", err);

      return res.status(500).json({
        message: "Failed to submit reflection"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Reflection not found"
      });
    }

    res.json({
      message: "Reflection submitted successfully"
    });
  });
};

// Export controller functions
module.exports = {
  getAllReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  submitReflection
};