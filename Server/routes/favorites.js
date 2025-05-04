const express = require("express");
const pool = require("../db");
const router = express.Router();
const jwtChecker = require("../utils/jwtchecker");

// Get Favorites
router.get("/:userId", jwtChecker, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!Number.isInteger(userId))
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const result = await pool.query(
      "SELECT doi FROM favorites WHERE user_id = $1",
      [userId]
    );
    res.json({ favorites: result.rows.map((row) => row.doi) });

    // Update last_active_at for current session
    await pool.query(
      `UPDATE user_online SET last_active_at = NOW()
       WHERE user_id = $1 AND logout_time IS NULL`,
      [userId]
    );
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Add/Remove Favorite
router.post("/", jwtChecker, async (req, res) => {
  const { userId, doi, isFav } = req.body;

  if (!Number.isInteger(userId) || !doi || typeof isFav !== "boolean") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    if (isFav) {
      await pool.query(
        "INSERT INTO favorites (user_id, doi) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [userId, doi]
      );
    } else {
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND doi = $2",
        [userId, doi]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
