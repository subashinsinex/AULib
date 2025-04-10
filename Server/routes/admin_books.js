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

const getTableCounts = async (client) => {
  try {
    const [res, ebook, ejournal] = await Promise.all([
      client.query("SELECT COUNT(*) FROM eresources"),
      client.query("SELECT COUNT(*) FROM ebooks"),
      client.query("SELECT COUNT(*) FROM ejournals"),
    ]);
    return {
      resId: parseInt(res.rows[0].count, 10),
      ebookId: parseInt(ebook.rows[0].count, 10),
      ejournalId: parseInt(ejournal.rows[0].count, 10),
    };
  } catch (error) {
    console.error("Error getting table counts:", error);
    throw error;
  }
};

const getResourceMaps = async () => {
  try {
    const [publishers, types] = await Promise.all([
      pool.query("SELECT pub_id AS id, publish_name AS name FROM publishers"),
      pool.query(
        "SELECT res_type_id AS id, type_name AS name FROM eresource_types"
      ),
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
      publisherMap: createMap(publishers.rows),
      resourceTypeMap: createMap(types.rows),
    };
  } catch (error) {
    console.error("Error getting resource maps:", error);
    throw error;
  }
};

const transformResourceRow = (row, maps) => {
  const { publisherMap, resourceTypeMap } = maps;
  return {
    title: row.title,
    file_url: row.file_url || null,
    pub_id: publisherMap[row.publisher?.toLowerCase().trim()],
    res_type_id: resourceTypeMap[row.resource_type?.toLowerCase().trim()],
    isbn: row.isbn || null,
    issn: row.issn || null,
  };
};

const insertResource = async (client, resource, counts, maps) => {
  await client.query("BEGIN");

  try {
    const newResId = counts.resId + 1;

    await client.query(
      `INSERT INTO eresources (res_id, title, pub_id, file_url, res_type_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newResId,
        resource.title,
        resource.pub_id,
        resource.file_url,
        resource.res_type_id,
      ]
    );

    if (resource.res_type_id === maps.resourceTypeMap["ebook"]) {
      const newEbookId = counts.ebookId + 1;
      await client.query(
        `INSERT INTO ebooks (ebook_id, res_id, isbn) VALUES ($1, $2, $3)`,
        [newEbookId, newResId, resource.isbn]
      );
      counts.ebookId = newEbookId;
    } else if (resource.res_type_id === maps.resourceTypeMap["ejournal"]) {
      const newEjournalId = counts.ejournalId + 1;
      await client.query(
        `INSERT INTO ejournals (ejournal_id, res_id, issn) VALUES ($1, $2, $3)`,
        [newEjournalId, newResId, resource.issn]
      );
      counts.ejournalId = newEjournalId;
    }

    counts.resId = newResId;
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

const cleanupFiles = (...filePaths) => {
  filePaths.forEach((filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error cleaning up file ${filePath}:`, err);
    }
  });
};

router.post(
  "/uploadExcelRes",
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
      cleanupFiles(req.file.path);
      return res.status(400).json({ error: "Invalid Excel file format" });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      cleanupFiles(req.file.path);
      return res.status(400).json({ error: "No data found in sheet" });
    }

    const client = await pool.connect();
    const errors = [];
    let successCount = 0;

    try {
      const maps = await getResourceMaps();
      const counts = await getTableCounts(client);

      await client.query("BEGIN");

      for (const [index, row] of rows.entries()) {
        try {
          const resource = transformResourceRow(row, maps);

          // Validate required fields
          if (!resource.title) throw new Error("Title is required");
          if (!resource.pub_id) throw new Error("Publisher not found");
          if (!resource.res_type_id) throw new Error("Invalid resource type");

          await insertResource(client, resource, counts, maps);
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
        const errorFileName = `eresource_import_errors_${timestamp}.xlsx`;
        const errorFilePath = path.join(__dirname, "../temp", errorFileName);

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
        cleanupFiles(req.file.path);
        return res.json({
          success: true,
          imported: successCount,
          message: `Successfully imported ${successCount} eResources`,
        });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in uploadExcelRes:", error);
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

// Get all publishers
router.get("/publishers", jwtChecker, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM publishers ORDER BY publish_name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching publishers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all resource types
router.get("/resource-types", jwtChecker, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM eresource_types ORDER BY type_name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching resource types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all resources with full details (eBooks + eJournals)
router.get("/resources-all", jwtChecker, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.res_id, 
        e.title, 
        e.pub_id, 
        e.file_url, 
        e.res_type_id,
        et.type_name AS resource_type,
        p.publish_name AS publisher_name,
        eb.isbn,
        ej.issn
      FROM eresources e
      LEFT JOIN eresource_types et ON e.res_type_id = et.res_type_id
      LEFT JOIN publishers p ON e.pub_id = p.pub_id
      LEFT JOIN ebooks eb ON e.res_id = eb.res_id
      LEFT JOIN ejournals ej ON e.res_id = ej.res_id
      ORDER BY e.title
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
