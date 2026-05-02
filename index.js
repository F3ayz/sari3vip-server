const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡' });
});

app.post('/download', async (req, res) => {
  const { url, quality } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'الرابط مطلوب' });
  }

  try {
    const apiUrl = `https://api.cobalt.tools/api/json`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vQuality: quality === 'mp3' ? '128' : quality || '720',
        isAudioOnly: quality === 'mp3',
        filenamePattern: 'basic',
      }),
    });

    const data = await response.json();
    
    if (data.status === 'stream' || data.status === 'redirect') {
      res.json({ url: data.url, status: 'success' });
    } else if (data.status === 'picker') {
      res.json({ url: data.picker[0].url, status: 'success' });
    } else {
      res.status(500).json({ error: 'فشل استخراج الرابط', details: data });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'خطأ في السيرفر', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سريع VIP Server يعمل على البورت ${PORT} ⚡`);
});