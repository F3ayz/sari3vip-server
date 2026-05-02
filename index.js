const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡' });
});

app.post('/download', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'الرابط مطلوب' });
  }

  try {
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        url: url,
        vQuality: '720',
        filenamePattern: 'basic',
      }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
    
    if (data.url) {
      res.json({ url: data.url, status: 'success' });
    } else if (data.picker && data.picker.length > 0) {
      res.json({ url: data.picker[0].url, status: 'success' });
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