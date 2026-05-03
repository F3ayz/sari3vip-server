const express = require('express');
const cors = require('cors');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();

app.use(cors());
app.use(express.json());

// ─── تثبيت yt-dlp تلقائياً على Railway (Linux) ───────────────────────────────
function ensureYtDlp() {
  try {
    execSync('yt-dlp --version', { stdio: 'ignore' });
    console.log('✅ yt-dlp موجود');
  } catch {
    console.log('📥 جاري تثبيت yt-dlp...');
    execSync(
      'curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp',
      { stdio: 'inherit' }
    );
    console.log('✅ تم تثبيت yt-dlp');
  }
}

// ─── تحديث تلقائي كل 24 ساعة ─────────────────────────────────────────────────
function startAutoUpdate() {
  setInterval(async () => {
    try {
      console.log('🔄 جاري تحديث yt-dlp...');
      execSync('yt-dlp -U', { stdio: 'inherit' });
      console.log('✅ تم تحديث yt-dlp');
    } catch (e) {
      console.log('⚠️ فشل التحديث:', e.message);
    }
  }, 24 * 60 * 60 * 1000); // كل 24 ساعة
}

// ─── Routes ──────────────────────────────────────────────────────────────────
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

    const cmd = `yt-dlp --no-playlist -f "${format}" --get-url "${url}"`;

    const { stdout } = await execAsync(cmd, { timeout: 30000 });

    const links = stdout.trim().split('\n').filter(l => l.startsWith('http'));

    if (links.length === 0) {
      return res.status(500).json({ error: 'لم يتم العثور على رابط' });
    }

    // رابط الفيديو (أول رابط) ورابط الصوت (ثاني رابط إن وجد)
    const videoUrl = links[0];
    const audioUrl = links[1] || null;

    console.log('✅ تم استخراج الرابط');
    res.json({ 
      success: true,
      download_url: videoUrl,
      audio_url: audioUrl,
      quality: quality
    });

  } catch (e) {
    console.error('❌ خطأ:', e.message);
    res.status(500).json({ error: 'فشل استخراج الرابط', details: e.message });
  }
});

// ─── تشغيل السيرفر ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

ensureYtDlp();
startAutoUpdate();

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
