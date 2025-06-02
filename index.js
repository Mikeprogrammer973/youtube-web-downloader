import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const YtDlpWrap = require('yt-dlp-wrap').default;

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(express.static('public'))

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ytDlpWrap = new YtDlpWrap();


ytDlpWrap.setBinaryPath(path.join(__dirname, 'bin', 'yt-dlp'));

const PORT = process.env.PORT || 3001;
const DOWNLOADS_DIR = './downloads';
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);


app.post('/download', async (req, res) => {
  const { url, type } = req.body;
  
  const filename = `mkd_ywd_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
  const outputPath = path.join(DOWNLOADS_DIR, filename.trim());

  const args = type === 'audio'
    ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '-o', outputPath]
    : ['-f', 'best', '-o', outputPath];

  try {
    await new Promise((resolve, reject) => {
      ytDlpWrap
        .exec([...args, '--ffmpeg-location', path.join(__dirname, 'bin'), url])
        .on('error', reject)
        .on('close', resolve);
    });

    res.download(outputPath, filename, () => fs.unlinkSync(outputPath));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao baixar o vídeo.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
