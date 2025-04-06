const { log1p } = Math; // log(1+x) helper

function rankResults(results, queryTerms = []) {
  const k1 = 1.5,
    b = 0.75; // BM25 parameters
  const currentYear = new Date().getFullYear();

  const ranked = results.map((item) => {
    const citations = parseInt(item["citedby-count"]) || 0;
    const isOpenAccess = item.openaccessFlag ? 1 : 0;
    const year = item["prism:coverDate"]
      ? parseInt(item["prism:coverDate"].substring(0, 4))
      : 0;
    const recency = Math.max(0, 1 - (currentYear - year) / 20); // Normalize recency score

    // BM25 estimation (based on title keyword matches & length)
    const title = item["dc:title"] || "";
    const titleLength = title.split(" ").length || 1;
    const keywordMatches = queryTerms.filter((term) =>
      title.toLowerCase().includes(term.toLowerCase())
    ).length;
    const bm25 =
      (keywordMatches * (k1 + 1)) /
      (keywordMatches + k1 * (1 - b + b * (titleLength / 10)));

    // Final ranking score
    const score =
      bm25 * 2 + log1p(citations) * 1.5 + recency * 1 + isOpenAccess * 0.5;

    return { ...item, score };
  });

  // Sorting with a tie-breaker for stable ordering
  const sortedResults = ranked.sort(
    (a, b) => b.score - a.score || a["dc:title"].localeCompare(b["dc:title"])
  );

  return sortedResults;
}

module.exports = { rankResults };
