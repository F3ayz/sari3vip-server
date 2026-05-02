const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const https = require('https');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡' });
});

app.post('/download', (req, res) => {
  const { url, quality } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'الرابط مطلوب' });
  }

  let format = 'best';
  if (quality === '1080') format = 'bestvideo[height<=1080]+bestaudio/best';
  if (quality === '720') format = 'bestvideo[height<=720]+bestaudio/best';
  if (quality === '480') format = 'bestvideo[height<=480]+bestaudio/best';
  if (quality === 'mp3') format = 'bestaudio/best';

  const ytdlpPath = process.platform === 'win32' ? './yt-dlp.exe' : 'yt-dlp';
  const cmd = `${ytdlpPath} -f "${format}" --get-url "${url}"`;
  
  exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ error: 'فشل استخراج الرابط', details: error.message });
    }
    
    const downloadUrl = stdout.trim().split('\n')[0];
    if (!downloadUrl) {
      return res.status(500).json({ error: 'لم يتم العثور على رابط' });
    }
    res.json({ url: downloadUrl, status: 'success' });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سريع VIP Server يعمل على البورت ${PORT} ⚡`);
});