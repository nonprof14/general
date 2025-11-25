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

// Helper function to normalize text and handle encoding issues
function normalizeText(text) {
  // Replace common mojibake patterns for Norwegian characters
  return text
    .replace(/�/g, '[øåæÆØÅ]')  // Replace � with character class
    .toLowerCase();
}

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

// Pattern matchers for number-based patterns (with encoding-safe patterns)
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
  const html = item.json.html;

  // Remove HTML tags to get plain text
  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  const foundKeywords = [];
  const matches = [];
  const patternMatches = [];

  // Search for simple keywords
  for (const [category, keywordList] of Object.entries(keywords)) {
    for (const keyword of keywordList) {
      // Create flexible pattern that handles encoding issues
      const flexiblePattern = createFlexiblePattern(keyword);
      const regex = new RegExp(flexiblePattern, 'gi');
      const keywordMatches = plainText.match(regex);

      if (keywordMatches && keywordMatches.length > 0) {
        foundKeywords.push(keyword);
        matches.push({
          keyword: keyword,
          category: category,
          count: keywordMatches.length,
          actualMatches: [...new Set(keywordMatches)]  // Show unique matches found
        });
      }
    }
  }

  // Search for pattern-based keywords (using encoding-safe patterns)
  for (const pattern of encodingSafePatterns) {
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
