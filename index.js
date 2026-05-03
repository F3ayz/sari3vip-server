const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡' });
});

const COBALT_INSTANCES = [
  'https://cobalt.ggtyler.dev',
  'https://cobalt.privacyredirect.com',
  'https://cobalt.sekanour.xyz',
];

app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'الرابط مطلوب' });

  for (const instance of COBALT_INSTANCES) {
    try {
      const response = await fetch(`${instance}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          videoQuality: '720',
          filenameStyle: 'basic',
        }),
      });

      const data = await response.json();
      console.log(`${instance} Response:`, JSON.stringify(data));

      if (data.url) return res.json({ url: data.url });
      if (data.picker && data.picker.length > 0) return res.json({ url: data.picker[0].url });
    } catch (e) {
      console.log(`${instance} failed:`, e.message);
    }
  }

  res.status(500).json({ error: 'فشلت كل المحاولات' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} ⚡`));
