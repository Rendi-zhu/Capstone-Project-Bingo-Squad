const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// CREATE evidence
const createEvidence = (req, res) => {
  const reflection_id = req.body.reflection_id;

  let file_name = req.body.file_name;
  let file_type = req.body.file_type;
  let file_url = req.body.file_url;

  if (req.file) {
    file_name = req.file.originalname;
    file_type = req.file.mimetype;
    file_url = `/uploads/${req.file.filename}`;
  }

  if (!reflection_id || !file_name) {
    return res.status(400).json({
      message: "reflection_id and file are required"
    });
  }

  const sql = `
    INSERT INTO evidence
    (
      reflection_id,
      file_name,
      file_type,
      file_url
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      reflection_id,
      file_name,
      file_type || null,
      file_url || null
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating evidence:", err);

        return res.status(500).json({
          message: "Failed to create evidence"
        });
      }

      res.status(201).json({
        message: "Evidence uploaded successfully",
        evidenceId: result.insertId,
        file: {
          name: file_name,
          type: file_type,
          url: file_url
        }
      });
    }
  );
};

// GET evidence by reflection ID
const getEvidenceByReflectionId = (req, res) => {
  const { reflectionId } = req.params;

  const sql = `
    SELECT *
    FROM evidence
    WHERE reflection_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [reflectionId], (err, results) => {
    if (err) {
      console.error("Error fetching evidence:", err);

      return res.status(500).json({
        message: "Failed to fetch evidence"
      });
    }

    res.json(results);
  });
};

// DELETE evidence and physical file
const deleteEvidence = (req, res) => {
  const { id } = req.params;

  const findSql = "SELECT * FROM evidence WHERE id = ?";

  db.query(findSql, [id], (findErr, results) => {
    if (findErr) {
      console.error("Error finding evidence:", findErr);

      return res.status(500).json({
        message: "Failed to find evidence"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Evidence not found"
      });
    }

    const evidence = results[0];

    const deleteSql = "DELETE FROM evidence WHERE id = ?";

    db.query(deleteSql, [id], (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting evidence:", deleteErr);

        return res.status(500).json({
          message: "Failed to delete evidence"
        });
      }

      if (evidence.file_url && evidence.file_url.startsWith("/uploads/")) {
        const fileName = path.basename(evidence.file_url);

        const filePath = path.join(
          __dirname,
          "../uploads",
          fileName
        );

        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (fileErr) => {
            if (fileErr) {
              console.error(
                "Evidence record deleted, but file deletion failed:",
                fileErr
              );
            }
          });
        }
      }

      res.json({
        message: "Evidence deleted successfully"
      });
    });
  });
};

module.exports = {
  createEvidence,
  getEvidenceByReflectionId,
  deleteEvidence
};