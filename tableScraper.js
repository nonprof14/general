// ============================================
// N8N CODE NODE - TABLE ROW SCRAPER
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.html or item.json.data field containing the table HTML
// Output: Returns array of items, one per table row
//
// Example output (multiple items):
// [
//   {
//     "saksnummer": "202556586",
//     "tittel": "Thereses gate 33 A - Pergola over eksisterende uteservering",
//     "status": "Avsluttet"
//   },
//   {
//     "saksnummer": "202556587",
//     "tittel": "Another case title",
//     "status": "Under behandling"
//   }
// ]
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

// Array to collect all results from all input items
const allResults = [];

// Process each input item
for (let item of $input.all()) {
  const html = item.json.data || item.json.html;

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
        allResults.push({
          status: status,
          tittel: tittel,
          saksnummer: saksnummer
        });
      }
    }
  }
}

// Return array of items - each table row becomes a separate n8n item
return allResults.map(result => ({ json: result }));
