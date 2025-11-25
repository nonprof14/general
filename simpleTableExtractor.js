// ============================================
// N8N CODE NODE - SIMPLE TABLE EXTRACTOR
// ============================================
// Simplified version for extracting case data
// Input: item.json.html (the HTML content)
// Output: Array of cases with saksnummer, tittel, status
// ============================================

const results = [];

for (let item of $input.all()) {
  const html = item.json.html || item.json.body || '';

  // Find all rows with case data
  // Looking for pattern: onclick="document.location = 'casedet.asp?mode=&caseno=NUMBER';"
  const rows = html.split('<tr');

  for (let row of rows) {
    // Skip if not a data row
    if (!row.includes('casedet.asp')) continue;

    // Extract case number from onclick
    const casenoMatch = row.match(/caseno=(\d+)/);
    if (!casenoMatch) continue;

    const saksnummer = casenoMatch[1];

    // Extract title - it's the text that appears as: = $0 " Text content "
    let tittel = '';
    const titleMatch = row.match(/=\s*\$0\s*"\s*([^"]+)"/);
    if (titleMatch) {
      tittel = titleMatch[1].trim();
    }

    // Alternative title extraction if first method fails
    if (!tittel) {
      const altMatch = row.match(/<td[^>]*align="left"[^>]*>\s*=\s*\$0\s*"\s*([^<]+)/);
      if (altMatch) {
        tittel = altMatch[1].replace(/"/g, '').trim();
      }
    }

    // Extract status (like "Avsluttet")
    let status = '';
    const statusMatch = row.match(/<td[^>]*align="center"[^>]*colspan="1"[^>]*>\s*([^<]+)\s*<\/td>/);
    if (statusMatch) {
      status = statusMatch[1].trim();
    }

    // Extract image if needed
    const imgMatch = row.match(/src="([^"]+)"/);
    const image = imgMatch ? imgMatch[1] : '';

    // Clean up HTML entities
    tittel = cleanText(tittel);
    status = cleanText(status);

    results.push({
      json: {
        saksnummer: saksnummer,
        tittel: tittel,
        status: status,
        image: image,
        caseUrl: `casedet.asp?mode=&caseno=${saksnummer}`
      }
    });
  }
}

function cleanText(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
    .trim();
}

return results.length > 0 ? results : $input.all();
