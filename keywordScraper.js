// ============================================
// N8N CODE NODE - KEYWORD SCRAPER
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.html field containing the page HTML
// Output: Returns found keywords and their matches
//
// Example output:
// {
//   "foundKeywords": ["ombygging", "leilighet"],
//   "matches": [
//     { "keyword": "ombygging", "count": 2 },
//     { "keyword": "leilighet", "count": 3 }
//   ],
//   "hasMatches": true
// }
// ============================================

// Define keyword groups
const keywords = {
  ombygging: [
    "ombygging",
    "ombygginger",
    "ombygge",
    "ombygget"
  ],
  omgjoring: [
    "omgjøring"
  ],
  bruksendring: [
    "bruksendring",
    "bruksendringer",
    "endring av bruk",
    "endret bruk"
  ],
  sammenfoyning: [
    "sammenføyning",
    "sammenføyninger",
    "sammenføye",
    "sammenføyd",
    "sammenslåing",
    "sammenslått"
  ],
  oppdeling: [
    "oppdeling",
    "oppdelinger",
    "oppdele",
    "oppdelt",
    "deling"
  ],
  leilighet: [
    "leilighet",
    "leiligheter"
  ]
};

// Pattern matchers for number-based patterns
const patterns = [
  {
    name: "fra_til_leilighet",
    regex: /fra\s+(\d+)\s+til\s+(\d+)\s+leilighet/gi,
    description: "fra [number] til [number] leilighet"
  },
  {
    name: "til_leiligheter",
    regex: /til\s+(\d+)\s+leiligheter/gi,
    description: "til [number] leiligheter"
  }
];

// Process each item
for (let item of $input.all()) {
  const html = item.json.html;

  // Remove HTML tags to get plain text
  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  const foundKeywords = [];
  const matches = [];
  const patternMatches = [];

  // Search for simple keywords
  for (const [category, keywordList] of Object.entries(keywords)) {
    for (const keyword of keywordList) {
      // Case-insensitive search
      const regex = new RegExp(keyword, 'gi');
      const keywordMatches = plainText.match(regex);

      if (keywordMatches && keywordMatches.length > 0) {
        foundKeywords.push(keyword);
        matches.push({
          keyword: keyword,
          category: category,
          count: keywordMatches.length
        });
      }
    }
  }

  // Search for pattern-based keywords
  for (const pattern of patterns) {
    const patternMatchResults = [...plainText.matchAll(pattern.regex)];

    if (patternMatchResults.length > 0) {
      patternMatches.push({
        pattern: pattern.description,
        name: pattern.name,
        count: patternMatchResults.length,
        matches: patternMatchResults.map(m => m[0])
      });
    }
  }

  // Store results in the item
  item.json.keywordResults = {
    foundKeywords: foundKeywords,
    matches: matches,
    patternMatches: patternMatches,
    hasMatches: foundKeywords.length > 0 || patternMatches.length > 0,
    totalMatches: matches.reduce((sum, m) => sum + m.count, 0) +
                   patternMatches.reduce((sum, m) => sum + m.count, 0)
  };
}

return $input.all();
