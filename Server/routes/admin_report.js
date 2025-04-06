const express = require("express");
const pool = require("../db");
const jwtChecker = require("../utils/jwtchecker");

const router = express.Router();

const adminChecker = async (req, res, next) => {
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
      // Assuming 1 is the admin category ID
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next(); // User is admin, proceed to the next middleware/route handler
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @api {get} /api/admin/reports/dashboard-stats Get Dashboard Statistics
 * @apiName GetDashboardStats
 * @apiGroup AdminReports
 * @apiPermission admin
 */
router.get("/dashboard-stats", jwtChecker, adminChecker, async (req, res) => {
  try {
    // Get total users
    const totalUsersQuery = `SELECT COUNT(*) AS total_users FROM user_auth`;
    const totalUsers = await pool.query(totalUsersQuery);

    // Get active users (logged in within last 30 minutes)
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) AS active_users 
      FROM user_online 
      WHERE logout_time IS NULL OR logout_time > (NOW() - INTERVAL '30 minutes')
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

/**
 * @api {get} /api/admin/reports/users-by-category Get Users by Category
 * @apiName GetUsersByCategory
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @api {get} /api/admin/reports/users-by-college Get Users by College
 * @apiName GetUsersByCollege
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

/**
 * @api {get} /api/admin/reports/users-by-batch Get Users by Batch Year
 * @apiName GetUsersByBatch
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

/**
 * @api {get} /api/admin/reports/users-active-status Get Active vs Inactive Users
 * @apiName GetUsersActiveStatus
 * @apiGroup AdminReports
 * @apiPermission admin
 */

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
    COUNT(*) FILTER (WHERE date_trunc('week', last_activity) = date_trunc('week', CURRENT_DATE)) AS active_week,
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

/**
 * @api {get} /api/admin/reports/resource-access Get Resource Access by Category
 * @apiName GetResourceAccess
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

/**
 * @api {get} /api/admin/reports/resource-usage Get Resource Usage Trends
 * @apiName GetResourceUsageTrends
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

/**
 * @api {get} /api/admin/reports/popular-resources Get Most Popular Resources
 * @apiName GetPopularResources
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

/**
 * @api {get} /api/admin/reports/user-activity Get Detailed User Activity
 * @apiName GetUserActivity
 * @apiGroup AdminReports
 * @apiPermission admin
 */
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

module.exports = router;
