# HTML Table Data Extraction for n8n

This repository contains JavaScript code for extracting data from HTML tables in n8n workflows.

## Files

1. **addressEncoder.js** - Encodes Norwegian addresses for URL parameters
2. **htmlTableExtractor.js** - Full-featured HTML table extractor
3. **simpleTableExtractor.js** - Simplified version (recommended)

## Quick Start - Simple Extractor

### Input Format

Your n8n workflow should provide HTML content in `item.json.html` or `item.json.body`:

```javascript
{
  "html": "<table>...</table>"
}
```

### Output Format

The extractor will return:

```javascript
{
  "saksnummer": "202556586",
  "tittel": "Thereses gate 33 A – Pergola over eksisterende uteservering",
  "status": "Avsluttet",
  "image": "img/abbB.png",
  "caseUrl": "casedet.asp?mode=&caseno=202556586"
}
```

### Setup in n8n

1. Create an HTTP Request node to fetch the HTML page
2. Add a Code node and paste the contents of `simpleTableExtractor.js`
3. The code will automatically extract all cases from the table
4. Each case becomes a separate item in your workflow

### Example Workflow

```
HTTP Request (GET)
  ↓
Code Node (simpleTableExtractor.js)
  ↓
Process each case...
```

## Field Descriptions

- **saksnummer** - The case number (e.g., "202556586")
- **tittel** - The case title/description
- **status** - Current status (e.g., "Avsluttet" = Completed)
- **image** - Image icon path
- **caseUrl** - Direct URL to case details

## HTML Structure Supported

The extractor works with tables containing rows like:

```html
<tr onclick="document.location = 'casedet.asp?mode=&caseno=202556586';">
  <td align="center">
    <img src="img/abbB.png">
    " 202556586 "
  </td>
  <td align="left">
    = $0 " Thereses gate 33 A – Pergola over eksisterende uteservering "
  </td>
  <td align="center" colspan="1">
    Avsluttet
  </td>
</tr>
```

## Testing

To test the extractor:

1. Copy your HTML source into n8n
2. Run the workflow
3. Check the output items for extracted data

## Troubleshooting

- **No results?** Check that your HTML contains `casedet.asp` links
- **Missing titles?** Verify the HTML contains the `= $0 "` pattern
- **Garbled text?** The `cleanText()` function handles common HTML entities

## Integration with Address Encoder

You can chain these tools:

```
HTTP Request (search by address)
  ↓
Code Node (addressEncoder.js) - encode address for search
  ↓
HTTP Request (submit search)
  ↓
Code Node (simpleTableExtractor.js) - extract results
  ↓
Process cases...
```
