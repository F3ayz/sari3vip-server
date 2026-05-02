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
    const apiUrl = `https://snapsave.app/action.php`;
    
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('lang', 'ar');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://snapsave.app/',
      },
      body: formData.toString(),
    });

    const text = await response.text();
    
    const urlMatch = text.match(/https?:\/\/[^\s"'<>]+\.(mp4|webm|mov)[^\s"'<>]*/i);
    
    if (urlMatch) {
      res.json({ url: urlMatch[0], status: 'success' });
    } else {
      res.status(500).json({ error: 'لم يتم العثور على رابط' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في السيرفر', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ⚡`);
});