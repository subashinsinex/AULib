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
  const { user_id, password } = req.body;
  if (!user_id || !password)
    return res.status(400).json({ error: "Missing user_id or password" });

  try {
    const result = await pool.query(
      "SELECT user_id, password, is_active FROM user_auth WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid user_id or password" });

    const user = result.rows[0];

    if (!user.is_active)
      return res.status(403).json({ error: "Account is deactivated" });

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch)
    //   return res.status(401).json({ error: "Invalid user_id or password" });

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
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing user_id" });

  try {
    await pool.query(
      `UPDATE user_online 
       SET logout_time = NOW() 
       WHERE user_id = $1 AND logout_time IS NULL`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

module.exports = router;
