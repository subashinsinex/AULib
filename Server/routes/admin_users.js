const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwtChecker = require("../utils/jwtchecker");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads") });

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

router.post("/add", jwtChecker, adminChecker, async (req, res) => {
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

router.get("/getUsers", jwtChecker, adminChecker, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ua.user_id, ua.email, ua.mobile, ua.is_active, 
        ud.name, uc.category_name, c.college_id,
        c.college_name, d.department_id, d.department_name, 
        b.branch_id, b.branch_name, dg.degree_id, dg.degree_name, 
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

router.put(
  "/toggleUserStatus/:userId",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    const { userId } = req.params;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First check if the user exists
      const userCheck = await client.query(
        "SELECT is_active FROM user_auth WHERE user_id = $1",
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentStatus = userCheck.rows[0].is_active;
      const newStatus = !currentStatus;

      // Update the user status
      await client.query(
        "UPDATE user_auth SET is_active = $1 WHERE user_id = $2",
        [newStatus, userId]
      );

      await client.query("COMMIT");
      res.json({
        message: `User ${newStatus ? "enabled" : "disabled"} successfully`,
        userId,
        newStatus,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error toggling user status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }
);

router.put(
  "/updateUser/:userId",
  jwtChecker,
  adminChecker,
  async (req, res) => {
    const { userId } = req.params;
    const {
      name,
      email,
      mobile,
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

      await client.query(
        `UPDATE user_auth SET email = $1, mobile = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3`,
        [email, mobile, userId]
      );

      await client.query(
        `UPDATE user_details SET name = $1, college_id = $2, department_id = $3, degree_id = $4, branch_id = $5, batch_in = $6, batch_out = $7 WHERE user_id = $8`,
        [
          name,
          college_id,
          department_id,
          degree_id,
          branch_id,
          batch_in,
          batch_out,
          userId,
        ]
      );

      await client.query("COMMIT");
      res.json({ message: "User updated successfully", userId });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }
);

const ensureDirectoriesExist = () => {
  const uploadsDir = path.join(__dirname, "../uploads");
  const tempDir = path.join(__dirname, "../temp");

  [uploadsDir, tempDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
ensureDirectoriesExist();

const getReferenceMaps = async () => {
  try {
    const [categories, colleges, departments, degrees, branches] =
      await Promise.all([
        pool.query(
          "SELECT user_cat_id AS id, category_name AS name FROM user_category"
        ),
        pool.query(
          "SELECT college_id AS id, college_name AS name FROM college"
        ),
        pool.query(
          "SELECT department_id AS id, department_name AS name FROM department"
        ),
        pool.query("SELECT degree_id AS id, degree_name AS name FROM degree"),
        pool.query("SELECT branch_id AS id, branch_name AS name FROM branch"),
      ]);

    const createMap = (rows) =>
      rows.reduce(
        (map, row) => ({
          ...map,
          [row.name.toLowerCase()]: row.id,
        }),
        {}
      );

    return {
      categoryMap: createMap(categories.rows),
      collegeMap: createMap(colleges.rows),
      departmentMap: createMap(departments.rows),
      degreeMap: createMap(degrees.rows),
      branchMap: createMap(branches.rows),
    };
  } catch (error) {
    console.error("Error getting reference maps:", error);
    throw error;
  }
};

const transformRow = (row, maps) => {
  const { categoryMap, collegeMap, departmentMap, degreeMap, branchMap } = maps;
  return {
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    user_cat_id: categoryMap[row.category_name?.toLowerCase().trim()],
    college_id: collegeMap[row.college_name?.toLowerCase().trim()],
    department_id: departmentMap[row.department_name?.toLowerCase().trim()],
    degree_id: degreeMap[row.degree_name?.toLowerCase().trim()],
    branch_id: branchMap[row.branch_name?.toLowerCase().trim()],
    batch_in: row.batch_in,
    batch_out: row.batch_out,
  };
};

const insertUser = async (client, user) => {
  await client.query("BEGIN");

  try {
    const password = await bcrypt.hash(user.mobile.toString(), 12);

    await client.query(
      `INSERT INTO user_auth (user_id, email, mobile, password)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, user.email, user.mobile, password]
    );

    await client.query(
      `INSERT INTO user_details (
        user_id, name, user_cat_id, college_id, department_id,
        degree_id, branch_id, batch_in, batch_out
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user.user_id,
        user.name,
        user.user_cat_id,
        user.college_id || null,
        user.department_id || null,
        user.degree_id || null,
        user.branch_id || null,
        user.batch_in || null,
        user.batch_out || null,
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

router.post(
  "/uploadExcelUser",
  jwtChecker,
  adminChecker,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let workbook;
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (error) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid Excel file format" });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "No data found in sheet" });
    }

    const client = await pool.connect();
    const errors = [];
    let successCount = 0;

    try {
      const maps = await getReferenceMaps();
      await client.query("BEGIN");

      for (const [index, row] of rows.entries()) {
        try {
          const user = transformRow(row, maps);

          const exists = await client.query(
            "SELECT 1 FROM user_auth WHERE user_id = $1 OR email = $2",
            [user.user_id, user.email]
          );

          if (exists.rows.length > 0) {
            throw new Error("User ID or email already exists");
          }

          await insertUser(client, user);
          successCount++;
        } catch (error) {
          errors.push({
            row: index + 2,
            ...row,
            error: error.message,
          });
        }
      }

      await client.query("COMMIT");

      if (errors.length > 0) {
        const errorWorkbook = xlsx.utils.book_new();
        const errorSheet = xlsx.utils.json_to_sheet(
          errors.map((error) => ({
            ...error,
            "Error Reason": error.error,
          }))
        );
        xlsx.utils.book_append_sheet(errorWorkbook, errorSheet, "Errors");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const errorFileName = `user_import_errors_${timestamp}.xlsx`;
        const errorFilePath = path.join(__dirname, "../temp", errorFileName);

        if (!fs.existsSync(path.dirname(errorFilePath))) {
          fs.mkdirSync(path.dirname(errorFilePath), { recursive: true });
        }

        xlsx.writeFile(errorWorkbook, errorFilePath);

        const fileBuffer = fs.readFileSync(errorFilePath);

        cleanupFiles(req.file.path, errorFilePath);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${errorFileName}`
        );
        return res.send(fileBuffer);
      } else {
        fs.unlinkSync(req.file.path);
        return res.json({
          success: true,
          imported: successCount,
          message: `Successfully imported ${successCount} users`,
        });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in uploadExcel:", error);
      cleanupFiles(req.file.path);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    } finally {
      client.release();
    }
  }
);

function cleanupFiles(...filePaths) {
  filePaths.forEach((filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error cleaning up file ${filePath}:`, err);
    }
  });
}

module.exports = router;
