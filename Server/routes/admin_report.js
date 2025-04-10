const express = require("express");
const pool = require("../db");
const jwtChecker = require("../utils/jwtchecker");

const router = express.Router();

const adminChecker = async (req, res, next) => {
  try {
    const userId = req.userId;
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

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

router.get("/dashboard-stats", jwtChecker, adminChecker, async (req, res) => {
  try {
    // Get total users
    const totalUsersQuery = `SELECT COUNT(*) AS total_users FROM user_auth`;
    const totalUsers = await pool.query(totalUsersQuery);

    // Get active users (logged in within last 30 minutes)
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) AS active_users 
      FROM user_online 
      WHERE logout_time IS NULL OR logout_time > (NOW() - INTERVAL '15 minutes')
    `;
    const activeUsers = await pool.query(activeUsersQuery);

    // Get new users this month
    const newUsersQuery = `
      SELECT COUNT(*) AS new_users 
      FROM user_auth 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const newUsers = await pool.query(newUsersQuery);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].total_users),
      activeUsers: parseInt(activeUsers.rows[0].active_users),
      newUsers: parseInt(newUsers.rows[0].new_users),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users-by-category", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        uc.category_name AS name,
        COUNT(ud.user_id) AS value,
        ROUND(COUNT(ud.user_id) * 100.0 / (SELECT COUNT(*) FROM user_details), 1) AS percentage
      FROM 
        user_details ud
      JOIN 
        user_category uc ON ud.user_cat_id = uc.user_cat_id
      GROUP BY 
        uc.category_name
      ORDER BY 
        COUNT(ud.user_id) DESC
    `;
    const result = await pool.query(query);
    res.json(
      result.rows.map((row) => ({
        name: row.name,
        value: Number(row.value),
        percentage: Number(row.percentage),
      }))
    );
  } catch (err) {
    console.error("Error fetching users by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users-by-college", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        c.college_name,
        COUNT(ud.user_id) AS user_count
      FROM 
        user_details ud
      JOIN 
        college c ON ud.college_id = c.college_id
      GROUP BY 
        c.college_name
      ORDER BY 
        COUNT(ud.user_id) DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users by college:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users-by-batch", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        batch_in AS year,
        COUNT(user_id) AS count
      FROM 
        user_details
      WHERE 
        batch_in IS NOT NULL
      GROUP BY 
        batch_in
      ORDER BY 
        batch_in ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users by batch:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/users-active-status",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    try {
      const query = `
      WITH combined_activity AS (
  SELECT user_id, MAX(last_active_at) AS last_activity_time
  FROM user_online
  GROUP BY user_id

  UNION ALL

  SELECT user_id, MAX(access_time) AS last_activity_time
  FROM user_access_log
  GROUP BY user_id
),
user_last_activity AS (
  SELECT user_id, MAX(last_activity_time) AS last_activity
  FROM combined_activity
  GROUP BY user_id
),
all_users AS (
  SELECT user_id FROM user_auth
),
final_activity AS (
  SELECT au.user_id, ula.last_activity
  FROM all_users au
  LEFT JOIN user_last_activity ula ON au.user_id = ula.user_id
),
metrics AS (
  SELECT
    COUNT(*) FILTER (WHERE last_activity > NOW() - INTERVAL '15 minutes') AS active_now,
    COUNT(*) FILTER (WHERE last_activity::date = CURRENT_DATE) AS active_today,
    COUNT(*) FILTER (WHERE last_activity >= date_trunc('week', CURRENT_DATE)) AS active_week,
    COUNT(*) FILTER (WHERE date_trunc('month', last_activity) = date_trunc('month', CURRENT_DATE)) AS active_month,
    COUNT(*) AS total_users
  FROM final_activity
)
SELECT 
  json_build_object(
    'activeNow', active_now::text,
    'activeToday', active_today::text,
    'activeThisWeek', active_week::text,
    'activeThisMonth', active_month::text,
    'totalUsers', total_users
  ) AS result
FROM metrics;
`;

      const result = await pool.query(query);
      res.json(result.rows[0].result);
    } catch (err) {
      console.error("Error fetching user activity status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/resource-access", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        uc.category_name,
        COUNT(ual.access_time) AS access_count
      FROM 
        user_access_log ual
      JOIN 
        user_details ud ON ual.user_id = ud.user_id
      JOIN 
        user_category uc ON ud.user_cat_id = uc.user_cat_id
      GROUP BY 
        uc.category_name
      ORDER BY 
        access_count DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching resource access by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/resource-usage", jwtChecker, adminChecker, async (req, res) => {
  try {
    const { timeframe = "month" } = req.query;

    let dateTrunc;
    switch (timeframe) {
      case "day":
        dateTrunc = "day";
        break;
      case "week":
        dateTrunc = "week";
        break;
      case "year":
        dateTrunc = "year";
        break;
      default:
        dateTrunc = "month";
    }

    const query = `
      SELECT 
        DATE_TRUNC($1, access_time) AS period,
        COUNT(*) AS access_count,
        COUNT(DISTINCT user_id) AS unique_users
      FROM 
        user_access_log
      GROUP BY 
        period
      ORDER BY 
        period ASC
    `;

    const result = await pool.query(query, [dateTrunc]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching resource usage trends:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/popular-resources", jwtChecker, adminChecker, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        r.res_id,
        r.title,
        rt.type_name AS resource_type,
        COUNT(ual.access_time) AS access_count
      FROM 
        user_access_log ual
      JOIN 
        eresources r ON ual.res_id = r.res_id
      JOIN 
        eresource_types rt ON r.res_type_id = rt.res_type_id
      GROUP BY 
        r.res_id, r.title, rt.type_name
      ORDER BY 
        access_count DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching popular resources:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user-activity", jwtChecker, adminChecker, async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;

    let query, params;

    if (userId) {
      query = `
        SELECT 
          ua.user_id,
          ud.name,
          uo.login_time,
          uo.logout_time,
          EXTRACT(EPOCH FROM (uo.logout_time - uo.login_time)) AS session_duration_seconds
        FROM 
          user_online uo
        JOIN 
          user_auth ua ON uo.user_id = ua.user_id
        JOIN 
          user_details ud ON ua.user_id = ud.user_id
        WHERE 
          ua.user_id = $1 AND
          uo.login_time >= NOW() - INTERVAL '${days} days'
        ORDER BY 
          uo.login_time DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT 
          ua.user_id,
          ud.name,
          uc.category_name,
          COUNT(uo.login_time) AS session_count,
          SUM(EXTRACT(EPOCH FROM (uo.logout_time - uo.login_time))) AS total_session_duration_seconds,
          COUNT(DISTINCT ual.res_id) AS distinct_resources_accessed
        FROM 
          user_auth ua
        JOIN 
          user_details ud ON ua.user_id = ud.user_id
        JOIN 
          user_category uc ON ud.user_cat_id = uc.user_cat_id
        LEFT JOIN 
          user_online uo ON ua.user_id = uo.user_id AND 
          uo.login_time >= NOW() - INTERVAL '${days} days'
        LEFT JOIN 
          user_access_log ual ON ua.user_id = ual.user_id AND
          ual.access_time >= NOW() - INTERVAL '${days} days'
        GROUP BY 
          ua.user_id, ud.name, uc.category_name
        ORDER BY 
          total_session_duration_seconds DESC NULLS LAST
        LIMIT 50
      `;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user activity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// E-Resource Statistics
router.get("/eresource-stats", jwtChecker, adminChecker, async (req, res) => {
  try {
    // Get total resources count
    const totalResQuery = await pool.query(
      "SELECT COUNT(*) AS total FROM eresources"
    );

    // Get total accesses count
    const totalAccessQuery = await pool.query(
      "SELECT COUNT(*) AS total FROM user_access_log"
    );

    // Get new resources this month
    const newResQuery = await pool.query(
      `SELECT COUNT(*) AS total FROM eresources 
             WHERE created_at >= date_trunc('month', CURRENT_DATE)`
    );

    res.json({
      totalResources: parseInt(totalResQuery.rows[0].total),
      totalAccesses: parseInt(totalAccessQuery.rows[0].total),
      newResources: parseInt(newResQuery.rows[0].total),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Resources by Type
router.get(
  "/eresources-by-type",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    try {
      const query = `
        SELECT 
          et.type_name AS type, 
          COUNT(e.res_id)::integer AS count,
          ROUND(
            COUNT(e.res_id) * 100.0 / 
            (SELECT COUNT(*) FROM eresources), 
            1
          ) AS percentage
        FROM eresources e
        JOIN eresource_types et ON e.res_type_id = et.res_type_id
        GROUP BY et.type_name
        ORDER BY count DESC
        `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Top Accessed E-Resources
router.get("/top-eresources", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
            SELECT e.res_id, e.title, COUNT(ual.access_time) AS access_count,
                   COALESCE(eb.isbn, ej.issn) AS identifier
            FROM eresources e
            LEFT JOIN ebooks eb ON e.res_id = eb.res_id
            LEFT JOIN ejournals ej ON e.res_id = ej.res_id
            JOIN user_access_log ual ON e.res_id = ual.res_id
            GROUP BY e.res_id, e.title, eb.isbn, ej.issn
            ORDER BY access_count DESC
            LIMIT 10
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Access Trends (Daily)
router.get("/access-trends", jwtChecker, adminChecker, async (req, res) => {
  try {
    const { period = "daily" } = req.query;

    let query;
    if (period === "monthly") {
      query = `
                SELECT 
                    to_char(date_trunc('month', access_time), 'YYYY-MM') AS date,
                    COUNT(*) AS count
                FROM user_access_log
                WHERE access_time >= CURRENT_DATE - INTERVAL '1 year'
                GROUP BY date_trunc('month', access_time)
                ORDER BY date_trunc('month', access_time)
            `;
    } else {
      // Default to daily
      query = `
                SELECT 
                    to_char(date_trunc('day', access_time), 'YYYY-MM-DD') AS date,
                    COUNT(*) AS count
                FROM user_access_log
                WHERE access_time >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY date_trunc('day', access_time)
                ORDER BY date_trunc('day', access_time)
            `;
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Resources by Publisher
router.get(
  "/eresources-by-publisher",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    try {
      const query = `
        SELECT 
          p.publish_name AS publisher, 
          COUNT(e.res_id)::integer AS count,
          ROUND(
            COUNT(e.res_id) * 100.0 / 
            (SELECT COUNT(*) FROM eresources), 
            1
          ) AS percentage
        FROM eresources e
        JOIN publishers p ON e.pub_id = p.pub_id
        GROUP BY p.publish_name
        ORDER BY count DESC
        LIMIT 10
        `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Top Accessed Publishers
router.get("/top-publishers", jwtChecker, adminChecker, async (req, res) => {
  try {
    const query = `
            SELECT p.publish_name AS publisher, COUNT(ual.access_time) AS access_count
            FROM publishers p
            JOIN eresources e ON p.pub_id = e.pub_id
            JOIN user_access_log ual ON e.res_id = ual.res_id
            GROUP BY p.publish_name
            ORDER BY access_count DESC
            LIMIT 10
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Top Users by Access Frequency
router.get(
  "/top-users-by-access",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    try {
      const query = `
        SELECT u.user_id,
          ud.name AS user_name,
          COUNT(ual.access_time) AS access_count
        FROM user_auth u
        JOIN user_details ud ON u.user_id = ud.user_id
        JOIN user_access_log ual ON u.user_id = ual.user_id
        GROUP BY u.user_id, ud.name
        ORDER BY access_count DESC
        LIMIT 10
        `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
