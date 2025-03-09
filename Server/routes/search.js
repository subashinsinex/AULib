const express = require("express");
const { fetchScopusData } = require("../utils/scopus");
const { rankResults } = require("../utils/ranking");
const pool = require("../db");
const jwtChecker = require("../utils/jwtchecker");

const router = express.Router();

// ✅ Basic Search
router.get("/fetch", jwtChecker, async (req, res) => {
  const { query = "AI", startIndex = 0, itemsPerPage = 25, userId } = req.query;

  try {
    const [results, favs] = await Promise.all([
      fetchScopusData(query, startIndex, itemsPerPage),
      userId
        ? pool.query("SELECT doi FROM favorites WHERE user_id = $1", [userId])
        : { rows: [] },
    ]);

    const favorites = new Set(favs.rows.map((row) => row.doi));
    const rankedResults = rankResults(results).map((item) => ({
      ...item,
      isFav: favorites.has(item["prism:doi"]),
    }));

    res.json(rankedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Advanced Search
router.get("/fetch-advanced", jwtChecker, async (req, res) => {
  const {
    title,
    author,
    publication,
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
  if (publication) queryParts.push(`SRCTITLE(${publication})`);
  if (doi) queryParts.push(`DOI(${doi})`);
  if (issn) queryParts.push(`ISSN(${issn})`);
  if (keyword) queryParts.push(`KEY(${keyword})`);

  if (!queryParts.length)
    return res.status(400).json({ error: "No search parameters provided" });

  const query = queryParts.join(" AND ");

  try {
    const [results, favs] = await Promise.all([
      fetchScopusData(query, startIndex, itemsPerPage),
      userId
        ? pool.query("SELECT doi FROM favorites WHERE user_id = $1", [userId])
        : { rows: [] },
    ]);

    const favorites = new Set(favs.rows.map((row) => row.doi));
    const rankedResults = rankResults(results).map((item) => ({
      ...item,
      isFav: favorites.has(item["prism:doi"]),
    }));

    res.json(rankedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
