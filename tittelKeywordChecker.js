// ============================================
// N8N CODE NODE - TITTEL KEYWORD CHECKER
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.tittel field (from table scraper results)
// Output: Returns whether keywords were found in the title
//
// Example output:
// {
//   "hasKeywords": true,
//   "foundKeywords": ["ombygging", "leiligheter"],
//   "matches": [...],
//   "totalMatches": 2
// }
// ============================================

// Helper function to create regex-safe pattern that handles encoding issues
function createFlexiblePattern(keyword) {
  // Replace Norwegian characters with patterns that match both correct and mojibake versions
  return keyword
    .replace(/ø/g, '(?:ø|�)')
    .replace(/Ø/g, '(?:Ø|�)')
    .replace(/å/g, '(?:å|�)')
    .replace(/Å/g, '(?:Å|�)')
    .replace(/æ/g, '(?:æ|�)')
    .replace(/Æ/g, '(?:Æ|�)');
}

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

// Create encoding-safe versions of patterns
const encodingSafePatterns = patterns.map(p => ({
  ...p,
  regex: new RegExp(createFlexiblePattern(p.regex.source), 'gi')
}));

// Process each item
for (let item of $input.all()) {
  const tittel = item.json.tittel || '';

  const foundKeywords = [];
  const matches = [];
  const patternMatches = [];

  // Search for simple keywords
  for (const [category, keywordList] of Object.entries(keywords)) {
    for (const keyword of keywordList) {
      // Create flexible pattern that handles encoding issues
      const flexiblePattern = createFlexiblePattern(keyword);
      const regex = new RegExp(flexiblePattern, 'gi');
      const keywordMatches = tittel.match(regex);

      if (keywordMatches && keywordMatches.length > 0) {
        foundKeywords.push(keyword);
        matches.push({
          keyword: keyword,
          category: category,
          count: keywordMatches.length,
          actualMatches: [...new Set(keywordMatches)]
        });
      }
    }
  }

  // Search for pattern-based keywords
  for (const pattern of encodingSafePatterns) {
    const patternMatchResults = [...tittel.matchAll(pattern.regex)];

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
  item.json.tittelKeywordCheck = {
    hasKeywords: foundKeywords.length > 0 || patternMatches.length > 0,
    foundKeywords: foundKeywords,
    matches: matches,
    patternMatches: patternMatches,
    totalMatches: matches.reduce((sum, m) => sum + m.count, 0) +
                   patternMatches.reduce((sum, m) => sum + m.count, 0)
  };
}

return $input.all();
