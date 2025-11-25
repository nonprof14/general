// ============================================
// N8N CODE NODE - TABLE ROW SCRAPER
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.html field containing the table HTML
// Output: Returns parsed data with saksnummer, tittel, and status
//
// Example output:
// {
//   "saksnummer": "202556586",
//   "tittel": "Thereses gate 33 A - Pergola over eksisterende uteservering",
//   "status": "Avsluttet"
// }
// ============================================

// Helper function to clean HTML and entities
function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/&nbsp;/g, ' ')           // Replace &nbsp; with space
    .replace(/&amp;/g, '&')            // Replace &amp; with &
    .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
    .trim();                           // Trim whitespace
}

// Process each item
for (let item of $input.all()) {
  const html = item.json.html;
  const results = [];

  // Find all table rows with onclick attribute (to filter actual data rows)
  const trMatches = html.matchAll(/<tr[^>]*onclick[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const trMatch of trMatches) {
    const rowHtml = trMatch[0];

    // Extract all td elements from this row
    const tdMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];

    if (tdMatches.length >= 3) {
      // Extract Saksnummer (first td - contains image and number)
      const saksnummerText = cleanText(tdMatches[0][0]);
      const saksnummerMatch = saksnummerText.match(/\d+/);
      const saksnummer = saksnummerMatch ? saksnummerMatch[0] : '';

      // Extract Tittel (second td)
      const tittel = cleanText(tdMatches[1][0]);

      // Extract Status (third td)
      const status = cleanText(tdMatches[2][0]);

      // Only add if we have valid data
      if (saksnummer && tittel && status) {
        results.push({
          status: status,
          tittel: tittel,
          saksnummer: saksnummer
        });
      }
    }
  }

  // Store results in the item
  item.json.results = results;
}

return $input.all();
