const express = require("express");
const pool = require("../db");
const router = express.Router();
const jwtChecker = require("../utils/jwtchecker");

// ✅ Get User Login Statistics
router.get("/login/:userId", jwtChecker, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const query = `
      SELECT 
        COUNT(*) AS total_logins,
        COUNT(CASE WHEN login_time >= NOW() - INTERVAL '1 month' THEN 1 END) AS monthly_logins,
        COUNT(CASE WHEN login_time >= NOW() - INTERVAL '1 year' THEN 1 END) AS yearly_logins
      FROM user_online
      WHERE user_id = $1;
    `;

    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0 || !rows[0].total_logins) {
      return res
        .status(404)
        .json({ error: "No login data found for this user" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching login statistics:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
