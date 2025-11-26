// ============================================
// N8N CODE NODE - CREATE LINKS FROM SAKSNUMMERS
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.debug_saksnummers (comma-separated string)
// Output: Creates proper links for each saksnummer
//
// Example output:
// {
//   "links": "https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=202556586, https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=202507347"
// }
// ============================================

// Get the saksnummers string
const saksnummersString = $input.first().json.debug_saksnummers || '';

// Split by comma and space, trim each, and filter out empty values
const saksnummers = saksnummersString
  .split(',')
  .map(s => s.trim())
  .filter(s => s !== '');

// Create links for each saksnummer
const links = saksnummers.map(saksnummer =>
  `https://innsyn.pbe.oslo.kommune.no/saksinnsyn/casedet.asp?mode=&caseno=${saksnummer}`
);

// Return the joined links
return [{
  json: {
    links: links.join(', '),
    linkCount: links.length,
    debug_saksnummersString: saksnummersString,
    debug_saksnummersArray: JSON.stringify(saksnummers),
    debug_linksArray: JSON.stringify(links)
  }
}];
