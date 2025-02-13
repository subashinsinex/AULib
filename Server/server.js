require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 5000;

app.get("/fetch", async (req, res) => {
  const query = req.query.query || "AI";
  const startIndex = parseInt(req.query.startIndex) || 0;
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 25;

  try {
    const response = await axios.get(
      `https://api.elsevier.com/content/search/scopus?query=${query}&start=${startIndex}&count=${itemsPerPage}`,
      {
        headers: { "X-ELS-APIKey": SCOPUS_API_KEY },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Search
app.get("/fetch-advanced", async (req, res) => {
  const { title, author, doi, issn, keyword, startIndex, itemsPerPage } =
    req.query;

  let queryParts = [];
  if (title) queryParts.push(`TITLE(${title})`);
  if (author) queryParts.push(`AUTH(${author})`);
  if (doi) queryParts.push(`DOI(${doi})`);
  if (issn) queryParts.push(`ISSN(${issn})`);
  if (keyword) queryParts.push(`KEY(${keyword})`);

  if (queryParts.length === 0) {
    return res.status(400).json({ error: "No search parameters provided" });
  }

  const query = queryParts.join(" AND ");
  const start = parseInt(startIndex) || 0;
  const count = parseInt(itemsPerPage) || 25;

  try {
    const response = await axios.get(
      `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
        query
      )}&start=${start}&count=${count}`,
      {
        headers: { "X-ELS-APIKey": SCOPUS_API_KEY },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, HOST, () =>
  console.log(`Server running at http://${HOST}:${PORT}`)
);
