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

// Process each item
for (let item of $input.all()) {
  const html = item.json.html;
  const results = [];

  // Find all table rows
  const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const trMatch of trMatches) {
    const rowHtml = trMatch[1];

    // Extract all td elements from this row
    const tdMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];

    if (tdMatches.length >= 3) {
      // Extract Saksnummer (first td, after the image tag)
      const saksnummerTd = tdMatches[0][1];
      const saksnummerMatch = saksnummerTd.match(/(\d+)/);
      const saksnummer = saksnummerMatch ? saksnummerMatch[1].trim() : '';

      // Extract Tittel (second td)
      const tittelTd = tdMatches[1][1];
      const tittel = tittelTd.replace(/<[^>]*>/g, '').trim();

      // Extract Status (third td)
      const statusTd = tdMatches[2][1];
      const status = statusTd.replace(/<[^>]*>/g, '').trim();

      // Only add if we have valid data
      if (saksnummer && tittel && status) {
        results.push({
          saksnummer: saksnummer,
          tittel: tittel,
          status: status
        });
      }
    }
  }

  // Store results in the item
  item.json.results = results;
}

return $input.all();
