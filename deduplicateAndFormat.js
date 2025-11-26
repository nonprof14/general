// ============================================
// N8N CODE NODE - DEDUPLICATE AND FORMAT RESULTS
// ============================================
// Paste this code into an n8n Code Node
// Input: Array of items with saksnummer and keywords
// Output: Deduplicated items with links and merged keywords
//
// Example output:
// [
//   {
//     "saksnummer": "202556586",
//     "link": "https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=202556586",
//     "tittel": "Thereses gate 33 A - Pergola over eksisterende uteservering",
//     "status": "Avsluttet",
//     "foundKeywords": ["deling", "leilighet"]
//   }
// ]
// ============================================

// Map to store deduplicated results by saksnummer
const deduplicatedMap = new Map();

// Process each input item
for (let item of $input.all()) {
  // Handle both direct array and nested array structure
  const items = item.json.array || [item.json];

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
}

// Convert map to array and return as n8n items
const results = Array.from(deduplicatedMap.values());

return results.map(result => ({ json: result }));
