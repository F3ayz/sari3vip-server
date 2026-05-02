const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const RAPIDAPI_KEY = 'c7f193283fmshda5eca4c4821618p12b006jsn62168ee85089';

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡' });
});

app.post('/download', async (req, res) => {
  const { url, quality } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'الرابط مطلوب' });
  }

  try {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://social-media-video-downloader.p.rapidapi.com/smvd/get/all?url=${encodedUrl}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
    
    if (data.links && data.links.length > 0) {
      const videoLink = data.links[0];
      res.json({ url: videoLink.link, status: 'success' });
    } else {
      res.status(500).json({ error: 'فشل', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ⚡`);
});