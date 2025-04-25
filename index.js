const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/analyze', async (req, res) => {
  const asins = req.body;
  const results = [];

  for (const asin of asins) {
    const url = `https://www.amazon.com/dp/${asin}`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await response.text();

      const bsrMatch = html.match(/Best Sellers Rank.*?#([\d,]+)\s+in\s+([^<]+)/i);
      const dateMatch = html.match(/Date First Available.*?>([^<]+)</i);

      results.push({
        asin,
        bsr: bsrMatch ? `#${bsrMatch[1]} in ${bsrMatch[2]}` : 'Not found',
        dateFirstAvailable: dateMatch ? dateMatch[1].trim() : 'Not found'
      });
    } catch (error) {
      results.push({ asin, error: error.message });
    }
  }

  res.json(results);
});

app.listen(port, () => {
  console.log(`TozzPod API running on port ${port}`);
});