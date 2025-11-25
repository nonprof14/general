// ============================================
// N8N CODE NODE - HTML TABLE DATA EXTRACTOR
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.html field containing the HTML table
// Output: Returns extracted data in item.json with saksnummer, tittel, and status
//
// Extracts:
// - Saksnummer (case number)
// - Tittel (title/description)
// - Status/result name
// ============================================

// Process each item
const results = [];

for (let item of $input.all()) {
  const html = item.json.html || item.json.body || '';

  // Extract all case rows from the HTML
  const cases = extractCases(html);

  // Add extracted cases to results
  for (let caseData of cases) {
    results.push({
      json: {
        ...item.json,
        saksnummer: caseData.saksnummer,
        tittel: caseData.tittel,
        status: caseData.status,
        image: caseData.image
      }
    });
  }
}

function extractCases(html) {
  const cases = [];

  // Find all rows with onclick event that contains case details
  const rowRegex = /<tr[^>]*onclick="document\.location\s*=\s*'casedet\.asp\?mode=&caseno=(\d+)'[^>]*>([\s\S]*?)<\/tr>/gi;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const caseno = match[1];
    const rowContent = match[2];

    // Extract image src
    const imgMatch = rowContent.match(/src="([^"]+)"/);
    const image = imgMatch ? imgMatch[1] : '';

    // Extract title - look for text between td tags with specific patterns
    // The title is in a td with align="left" and class="searchResult"
    const titleMatch = rowContent.match(/<td[^>]*align="left"[^>]*class="searchResult"[^>]*>\s*=\s*\$0\s*"\s*([^"]+)"/);
    let tittel = '';

    if (titleMatch) {
      tittel = titleMatch[1].trim();
      // Decode HTML entities
      tittel = decodeHtmlEntities(tittel);
    } else {
      // Alternative extraction: get text between the specific td tags
      const altMatch = rowContent.match(/<td[^>]*align="left"[^>]*>\s*=\s*\$0\s*"\s*([^<]+)/);
      if (altMatch) {
        tittel = altMatch[1].replace(/"/g, '').trim();
        tittel = decodeHtmlEntities(tittel);
      }
    }

    // Extract status - usually in the last td
    const statusMatch = rowContent.match(/<td[^>]*align="center"[^>]*colspan="1"[^>]*>\s*([^<]+)\s*<\/td>/);
    const status = statusMatch ? statusMatch[1].trim() : '';

    cases.push({
      saksnummer: caseno,
      tittel: tittel,
      status: decodeHtmlEntities(status),
      image: image
    });
  }

  return cases;
}

function decodeHtmlEntities(text) {
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#8211;': '–',
    '&#8212;': '—',
    '&ndash;': '–',
    '&mdash;': '—'
  };

  let decoded = text;
  for (let entity in entities) {
    decoded = decoded.replace(new RegExp(entity, 'g'), entities[entity]);
  }

  // Decode numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

  return decoded;
}

return results.length > 0 ? results : $input.all();
