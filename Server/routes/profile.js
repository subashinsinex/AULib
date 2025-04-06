const express = require("express");
const pool = require("../db");
const router = express.Router();
const jwtChecker = require("../utils/jwtchecker");

// ✅ Get User Profile (Fixed)
router.get("/:userId", jwtChecker, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const authUserId = req.userId; // Extracted from jwtChecker middleware

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // ✅ Ensure user can only access their own profile
  if (authUserId !== userId.toString()) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const query = `
      SELECT 
        ua.user_id, ua.email, ua.mobile, 
        ud.name, uc.category_name, 
        c.college_name, d.department_name, 
        b.branch_name, dg.degree_name, 
        ud.batch_in, ud.batch_out,
        uo.login_time AS last_login
      FROM user_auth ua
      LEFT JOIN user_details ud ON ua.user_id = ud.user_id
      LEFT JOIN user_category uc ON ud.user_cat_id = uc.user_cat_id
      LEFT JOIN college c ON ud.college_id = c.college_id
      LEFT JOIN department d ON ud.department_id = d.department_id
      LEFT JOIN branch b ON ud.branch_id = b.branch_id
      LEFT JOIN degree dg ON ud.degree_id = dg.degree_id
      LEFT JOIN user_online uo ON ua.user_id = uo.user_id
      WHERE ua.user_id = $1
      ORDER BY uo.login_time DESC
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error); // Log the full error for debugging
    res.status(500).json({ error: `Database error: ${error.message}` }); // Include the error message in the response
  }
});

module.exports = router;
