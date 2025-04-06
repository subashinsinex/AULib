const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!SECRET_KEY || !REFRESH_SECRET) {
  throw new Error(
    "SECRET_KEY or REFRESH_SECRET is not defined in the environment variables"
  );
}

// ✅ User Login (Checks is_active before login)
router.post("/login", async (req, res) => {
  const { user_id, password, platform } = req.body;
  if (!user_id || !password || !platform)
    return res
      .status(400)
      .json({ error: "Missing user_id, password or platform" });

  try {
    const result = await pool.query(
      `SELECT ua.user_id, ua.password, ua.is_active, uc.category_name 
       FROM user_auth ua
       JOIN user_details ud ON ua.user_id = ud.user_id
       JOIN user_category uc ON ud.user_cat_id = uc.user_cat_id
       WHERE ua.user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid user_id" });

    const user = result.rows[0];

    if (!user.is_active)
      return res.status(403).json({ error: "Account is deactivated" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid password" });

    // ✅ Restrict web login to admins only
    if (platform === "web" && user.category_name !== "admin") {
      return res.status(403).json({ error: "Only admins can log in from web" });
    }

    // ✅ Check if the user has an active session
    const activeSession = await pool.query(
      `SELECT * FROM user_online 
       WHERE user_id = $1 AND logout_time IS NULL`,
      [user.user_id]
    );

    if (activeSession.rows.length > 0) {
      // ✅ Logout previous session
      await pool.query(
        `UPDATE user_online 
         SET logout_time = NOW() 
         WHERE user_id = $1 AND logout_time IS NULL`,
        [user.user_id]
      );
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ userId: user.user_id }, SECRET_KEY, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user.user_id }, REFRESH_SECRET, {
      expiresIn: "14d",
    });

    // ✅ Store new login time
    await pool.query(
      `INSERT INTO user_online (user_id, login_time) 
       VALUES ($1, NOW())`,
      [user.user_id]
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

// ✅ Refresh Token
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const userId = decoded.userId;

    // Check if the refresh token is valid for the user
    const user = await pool.query(
      "SELECT user_id FROM user_auth WHERE user_id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // ✅ Update last_active_at for current session
    await pool.query(
      `UPDATE user_online SET last_active_at = NOW()
       WHERE user_id = $1 AND logout_time IS NULL`,
      [userId]
    );

    const accessToken = jwt.sign({ userId }, SECRET_KEY, {
      expiresIn: "15m",
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

// ✅ User Logout (Update logout time)
router.post("/logout", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    // ✅ Mark user as logged out
    await pool.query(
      `UPDATE user_online SET logout_time = NOW() 
       WHERE user_id = $1 AND logout_time IS NULL`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
});

module.exports = router;
