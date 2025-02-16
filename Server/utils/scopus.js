const axios = require("axios");
const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;

async function fetchScopusData(query, startIndex, itemsPerPage) {
  const url = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
    query
  )}&start=${startIndex}&count=${itemsPerPage}`;

  const response = await axios.get(url, {
    headers: { "X-ELS-APIKey": SCOPUS_API_KEY },
  });

  return response.data["search-results"].entry || [];
}

module.exports = { fetchScopusData };
