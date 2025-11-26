// ============================================
// N8N CODE NODE - DEDUPLICATE AND FORMAT RESULTS
// ============================================
// Paste this code into an n8n Code Node
// Input: Array of items with saksnummer and keywords at $input.first().json.array
// Output: Single item with all links and keywords as comma-separated strings
//
// Example output:
// {
//   "links": "https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=202556586, https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=202507347",
//   "foundKeywords": "deling, omgjøring, leilighet",
//   "keywordCount": 3
// }
// ============================================

// Map to store deduplicated results by saksnummer
const deduplicatedMap = new Map();

// Get the array from the input
const items = $input.first().json.array || [];

// Process each record in the array
for (let record of items) {
  const saksnummer = record.saksnummer;

  // Skip if no saksnummer
  if (!saksnummer) continue;

  // Collect all keywords from different sources
  const allKeywords = [
    ...(record.foundKeywordsTittel || []),
    ...(record.foundKeywords || []),
    ...(record.foundKeywordsSubpage || [])
  ];

  // If saksnummer already exists, merge keywords
  if (deduplicatedMap.has(saksnummer)) {
    const existing = deduplicatedMap.get(saksnummer);

    // Merge keywords and remove duplicates
    const mergedKeywords = [...new Set([...existing.foundKeywords, ...allKeywords])];
    existing.foundKeywords = mergedKeywords;
  } else {
    // Create new entry with unique keywords
    deduplicatedMap.set(saksnummer, {
      saksnummer: saksnummer,
      link: `https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=${saksnummer}`,
      tittel: record.tittel || '',
      status: record.status || '',
      foundKeywords: [...new Set(allKeywords)]  // Remove duplicates
    });
  }
}

// Convert map to array
const results = Array.from(deduplicatedMap.values());

// Collect all links
const allLinks = results.map(r => r.link);

// Collect all unique keywords from all results
const allKeywordsSet = new Set();
results.forEach(r => {
  r.foundKeywords.forEach(keyword => allKeywordsSet.add(keyword));
});

// Convert keywords to array for final output
const uniqueKeywords = Array.from(allKeywordsSet);

// Return single item with comma-separated strings and count
return [{
  json: {
    links: allLinks.join(', '),
    foundKeywords: uniqueKeywords.join(', '),
    keywordCount: uniqueKeywords.length
  }
}];
