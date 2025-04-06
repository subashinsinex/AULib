const express = require("express");
const pool = require("../db");
const router = express.Router();
const jwtChecker = require("../utils/jwtchecker");

// Get All eResources (eBooks, eJournals, etc.)
router.get("/", jwtChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.res_id, 
        e.title, 
        e.file_url, 
        p.publish_name, 
        t.type_name 
      FROM eresources e
      LEFT JOIN publishers p ON e.pub_id = p.pub_id
      LEFT JOIN eresource_types t ON e.res_type_id = t.res_type_id
      ORDER BY e.res_id DESC;
    `;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No resources found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching eResources:", error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/log-access", jwtChecker, async (req, res) => {
  const { res_id, user_id } = req.body;
  const user_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const formatted_ip = user_ip.includes("::ffff:")
    ? user_ip.split("::ffff:")[1]
    : user_ip;
  if (!res_id) {
    return res.status(400).json({ error: "Resource ID is required" });
  }

  try {
    await pool.query(
      `INSERT INTO user_access_log (user_id, res_id, access_time,ip_address) VALUES ($1, $2, NOW(),$3 )`,
      [user_id, res_id, formatted_ip]
    );

    await pool.query(
      `UPDATE user_online SET last_active_at = NOW()
       WHERE user_id = $1 AND logout_time IS NULL`,
      [user_id]
    );

    res.json({ message: "Resource access logged successfully" });
  } catch (error) {
    console.error("Error logging resource access:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
