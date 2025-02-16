require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
});

// ✅ Get Favorites
app.get("/favorites/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!Number.isInteger(userId))
    return res.status(400).json({ error: "Invalid user ID" });
  try {
    const result = await pool.query(
      "SELECT doi FROM favorites WHERE user_id = $1",
      [userId]
    );
    res.json({ favorites: result.rows.map((row) => row.doi) });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Add/Remove Favorite
app.post("/favorites", async (req, res) => {
  const { userId, doi, isFav } = req.body;
  if (!Number.isInteger(userId) || !doi)
    return res.status(400).json({ error: "Invalid input" });
  try {
    if (isFav) {
      await pool.query(
        "INSERT INTO favorites (user_id, doi) VALUES ($1, $2) ON CONFLICT (user_id, doi) DO NOTHING",
        [userId, doi]
      );
    } else {
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND doi = $2",
        [userId, doi]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Fetch Data (Basic Search) - FIXED
app.get("/fetch", async (req, res) => {
  const { query = "AI", startIndex = 0, itemsPerPage = 25, userId } = req.query;

  try {
    const [response, favs] = await Promise.all([
      axios.get(
        `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
          query
        )}&start=${startIndex}&count=${itemsPerPage}`,
        {
          headers: { "X-ELS-APIKey": SCOPUS_API_KEY },
        }
      ),
      userId
        ? pool.query("SELECT doi FROM favorites WHERE user_id = $1", [userId])
        : { rows: [] },
    ]);

    if (!response.data || !response.data["search-results"]) {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    const favorites = new Set(favs.rows.map((row) => row.doi));
    const results = response.data["search-results"].entry || [];

    results.forEach((item) => (item.isFav = favorites.has(item["prism:doi"])));

    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Advanced Search - FIXED
app.get("/fetch-advanced", async (req, res) => {
  const {
    title,
    author,
    doi,
    issn,
    keyword,
    startIndex = 0,
    itemsPerPage = 25,
    userId,
  } = req.query;

  let queryParts = [];
  if (title) queryParts.push(`TITLE(${title})`);
  if (author) queryParts.push(`AUTH(${author})`);
  if (doi) queryParts.push(`DOI(${doi})`);
  if (issn) queryParts.push(`ISSN(${issn})`);
  if (keyword) queryParts.push(`KEY(${keyword})`);

  if (!queryParts.length) {
    return res.status(400).json({ error: "No search parameters provided" });
  }

  const query = queryParts.join(" AND ");

  try {
    const [response, favs] = await Promise.all([
      axios.get(
        `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
          query
        )}&start=${startIndex}&count=${itemsPerPage}`,
        {
          headers: { "X-ELS-APIKey": SCOPUS_API_KEY },
        }
      ),
      userId
        ? pool.query("SELECT doi FROM favorites WHERE user_id = $1", [userId])
        : { rows: [] },
    ]);

    // Check if the response contains the expected data structure
    if (!response.data || !response.data["search-results"]) {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    const favorites = new Set(favs.rows.map((row) => row.doi));
    const results = response.data["search-results"].entry || [];

    // Apply favorites to results
    const updatedResults = results.map((item) => ({
      ...item,
      isFav: item["prism:doi"] ? favorites.has(item["prism:doi"]) : false,
    }));

    res.json(updatedResults);
  } catch (error) {
    console.error("Error fetching advanced search data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, HOST, () =>
  console.log(`Server running at http://${HOST}:${PORT}`)
);
