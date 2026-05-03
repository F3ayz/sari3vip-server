const express = require('express');
const cors = require('cors');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();

app.use(cors());
app.use(express.json());

// تحديث yt-dlp كل 24 ساعة تلقائياً
setInterval(() => {
  try {
    execSync('yt-dlp -U', { stdio: 'inherit' });
    console.log('✅ تم تحديث yt-dlp');
  } catch (e) {
    console.log('⚠️ فشل التحديث:', e.message);
  }
}, 24 * 60 * 60 * 1000);

app.get('/', (req, res) => {
  res.json({ status: 'سريع VIP Server يعمل! ⚡', engine: 'yt-dlp' });
});

app.post('/download', async (req, res) => {
  const { url, quality = '720' } = req.body;
  if (!url) return res.status(400).json({ error: 'الرابط مطلوب' });

  console.log(`📥 طلب: ${url} | جودة: ${quality}`);

  try {
    const format = quality === 'mp3'
      ? 'bestaudio/best'
      : `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;

    const { stdout } = await execAsync(
      `yt-dlp --no-playlist -f "${format}" --get-url "${url}"`,
      { timeout: 30000 }
    );

    const links = stdout.trim().split('\n').filter(l => l.startsWith('http'));

    if (links.length === 0) {
      return res.status(500).json({ error: 'لم يتم العثور على رابط' });
    }

    console.log('✅ تم استخراج الرابط');
    res.json({
      success: true,
      download_url: links[0],
      audio_url: links[1] || null,
      quality
    });

  } catch (e) {
    console.error('❌ خطأ:', e.message);
    res.status(500).json({ error: 'فشل استخراج الرابط', details: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
