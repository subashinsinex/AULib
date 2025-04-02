const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtChecker = require("../utils/jwtchecker");

const router = express.Router();

router.post("/add", jwtChecker, async (req, res) => {
  const {
    user_id,
    name,
    email,
    mobile,
    user_cat_id,
    college_id,
    department_id,
    degree_id,
    branch_id,
    batch_in,
    batch_out,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userCheckQuery = `SELECT * FROM user_auth WHERE user_id = $1 OR email = $2`;
    const userCheckResult = await client.query(userCheckQuery, [
      user_id,
      email,
    ]);

    if (userCheckResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this ID or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(mobile.toString(), 12);

    await client.query(
      `INSERT INTO user_auth (user_id, email, mobile, password) VALUES ($1, $2, $3, $4)`,
      [user_id, email, mobile, hashedPassword]
    );

    await client.query(
      `INSERT INTO user_details (user_id, name, user_cat_id, college_id, department_id, degree_id, branch_id, batch_in, batch_out) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user_id,
        name,
        user_cat_id || null,
        college_id || null,
        department_id || null,
        degree_id || null,
        branch_id || null,
        batch_in || null,
        batch_out || null,
      ]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "User added successfully", user_id });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: `Database error: ${error.message}` });
  } finally {
    client.release();
  }
});

router.get("/getUsers", jwtChecker, async (req, res) => {
  try {
    const userId = req.userId; // Extracted from JWT token

    // Check if the logged-in user is an admin
    const adminCheck = await pool.query(
      "SELECT user_cat_id FROM user_details WHERE user_id = $1",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (adminCheck.rows[0].user_cat_id !== 1) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const result = await pool.query(
      `SELECT 
        ua.user_id, ua.email, ua.mobile, 
        ud.name, uc.category_name, 
        c.college_name, d.department_name, 
        b.branch_name, dg.degree_name, 
        ud.batch_in, ud.batch_out
      FROM user_auth ua
      LEFT JOIN user_details ud ON ua.user_id = ud.user_id
      LEFT JOIN user_category uc ON ud.user_cat_id = uc.user_cat_id
      LEFT JOIN college c ON ud.college_id = c.college_id
      LEFT JOIN department d ON ud.department_id = d.department_id
      LEFT JOIN branch b ON ud.branch_id = b.branch_id
      LEFT JOIN degree dg ON ud.degree_id = dg.degree_id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
