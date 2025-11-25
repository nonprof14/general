/**
 * Encodes an address string to URL format using ISO-8859-1 encoding
 * Converts spaces to + and special characters to their percent-encoded equivalents
 *
 * @param {string} address - The address to encode (e.g., "Ansgar Sørlies vei 50")
 * @returns {string} The encoded address with search parameter appended
 */
function encodeAddress(address) {
  // Encode the address using ISO-8859-1 (Latin-1) encoding
  // Note: ø (U+00F8) becomes %F8 in ISO-8859-1
  let encoded = '';

  for (let i = 0; i < address.length; i++) {
    const char = address[i];

    if (char === ' ') {
      // Spaces become + signs
      encoded += '+';
    } else if (/[a-zA-Z0-9]/.test(char)) {
      // Alphanumeric characters remain unchanged
      encoded += char;
    } else {
      // Special characters are percent-encoded using ISO-8859-1
      const charCode = char.charCodeAt(0);

      // For characters in the ISO-8859-1 range (0-255)
      if (charCode <= 255) {
        encoded += '%' + charCode.toString(16).toUpperCase().padStart(2, '0');
      } else {
        // For characters outside ISO-8859-1, use UTF-8 encoding as fallback
        encoded += encodeURIComponent(char);
      }
    }
  }

  // Append the search parameter
  encoded += '&doSearch2=S%F8k+i+sak+';

  return encoded;
}

/**
 * Alternative implementation using a conversion table for common Norwegian characters
 * This ensures correct ISO-8859-1 encoding for Norwegian special characters
 */
function encodeAddressAlt(address) {
  // Map of Norwegian characters to their ISO-8859-1 percent encoding
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
      // For other characters, use ISO-8859-1 encoding
      const charCode = char.charCodeAt(0);
      if (charCode <= 255) {
        encoded += '%' + charCode.toString(16).toUpperCase().padStart(2, '0');
      } else {
        encoded += encodeURIComponent(char);
      }
    }
  }

  encoded += '&doSearch2=S%F8k+i+sak+';

  return encoded;
}

// Example usage:
if (typeof module !== 'undefined' && module.exports) {
  // Node.js export
  module.exports = {
    encodeAddress,
    encodeAddressAlt
  };
}

// Browser usage example:
if (typeof window !== 'undefined') {
  window.encodeAddress = encodeAddress;
  window.encodeAddressAlt = encodeAddressAlt;
}

// Test examples
console.log('Example 1:');
console.log('Input:  "Ansgar Sørlies vei 50"');
console.log('Output: "' + encodeAddress('Ansgar Sørlies vei 50') + '"');
console.log('');
console.log('Example 2 (Alternative):');
console.log('Input:  "Ansgar Sørlies vei 50"');
console.log('Output: "' + encodeAddressAlt('Ansgar Sørlies vei 50') + '"');
