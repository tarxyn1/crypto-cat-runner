import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static WebApp files (index.html lives in /public)
app.use(express.static(path.join(__dirname, 'public')));

// Validate Telegram initData (per WebApp auth docs)
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
app.post('/api/validate', (req, res) => {
  try {
    const { initData } = req.body || {};
    if (!initData) return res.status(400).json({ ok:false, error: 'initData required' });

    const data = new URLSearchParams(initData);
    const hash = data.get('hash');
    data.delete('hash');
    const sorted = [...data.entries()].sort((a,b)=> a[0].localeCompare(b[0]));
    const checkString = sorted.map(([k,v]) => `${k}=${v}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
    const computed = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    const ok = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
    if (!ok) return res.status(401).json({ ok:false, error: 'invalid hash' });

    return res.json({ ok:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error: 'server_error' });
  }
});

// Minimal "save score" stub
const SCORES = new Map(); // in-memory (replace with DB in production)
app.post('/api/score', (req, res) => {
  const { user_id, score } = req.body || {};
  if (!user_id) return res.status(400).json({ ok:false, error: 'user_id required' });
  const s = Number(score||0) | 0;
  const best = Math.max(SCORES.get(user_id) || 0, s);
  SCORES.set(user_id, best);
  res.json({ ok:true, best });
});
app.get('/api/score/:user_id', (req, res) => {
  const u = req.params.user_id;
  res.json({ ok:true, best: SCORES.get(u) || 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WebApp server running on http://localhost:${PORT}`);
});
