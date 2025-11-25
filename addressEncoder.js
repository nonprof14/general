// ============================================
// N8N CODE NODE - ADDRESS URL ENCODER
// ============================================
// Paste this code into an n8n Code Node
// Input: Expects item.json.address field
// Output: Returns encoded address in item.json.encodedAddress
//
// Example: "Ansgar Sørlies vei 50" → "Ansgar+S%F8rlies+vei+50&doSearch2=S%F8k+i+sak+"
// ============================================

// Map of Norwegian/European characters to ISO-8859-1 percent encoding
const iso88591Map = {
  'æ': '%E6', 'Æ': '%C6',
  'ø': '%F8', 'Ø': '%D8',
  'å': '%E5', 'Å': '%C5',
  'é': '%E9', 'É': '%C9',
  'è': '%E8', 'È': '%C8',
  'ê': '%EA', 'Ê': '%CA',
  'ë': '%EB', 'Ë': '%CB',
  'á': '%E1', 'Á': '%C1',
  'à': '%E0', 'À': '%C0',
  'â': '%E2', 'Â': '%C2',
  'ä': '%E4', 'Ä': '%C4',
  'ó': '%F3', 'Ó': '%D3',
  'ò': '%F2', 'Ò': '%D2',
  'ô': '%F4', 'Ô': '%D4',
  'ö': '%F6', 'Ö': '%D6',
  'ú': '%FA', 'Ú': '%DA',
  'ù': '%F9', 'Ù': '%D9',
  'û': '%FB', 'Û': '%DB',
  'ü': '%FC', 'Ü': '%DC',
  'ý': '%FD', 'Ý': '%DD',
  'ñ': '%F1', 'Ñ': '%D1',
  'ç': '%E7', 'Ç': '%C7'
};

// Process each item
for (let item of $input.all()) {
  const address = item.json.address;
  let encoded = '';

  for (let i = 0; i < address.length; i++) {
    const char = address[i];

    if (char === ' ') {
      encoded += '+';
    } else if (iso88591Map[char]) {
      encoded += iso88591Map[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      encoded += char;
    } else {
      const charCode = char.charCodeAt(0);
      if (charCode <= 255) {
        encoded += '%' + charCode.toString(16).toUpperCase().padStart(2, '0');
      } else {
        encoded += encodeURIComponent(char);
      }
    }
  }

  encoded += '&doSearch2=S%F8k+i+sak+';

  item.json.encodedAddress = encoded;
}

return $input.all();
