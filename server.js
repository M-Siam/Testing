// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Only allow your website (replace with your domain)
const ALLOWED_ORIGIN = 'https://yourwebsite.com'; // ← CHANGE THIS!

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Proxy for .m3u8
app.get('/stream.m3u8', async (req, res) => {
  try {
    const response = await fetch('https://owrcovcrpy.gpcdn.net/bpk-tv/1701/output/index.m3u8');
    let m3u8 = await response.text();

    // Also proxy the .ts files (video chunks)
    m3u8 = m3u8.replace(/\.ts/g, '.ts');

    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(m3u8);
  } catch (err) {
    console.error(err);
    res.status(500).send('Stream error');
  }
});

// Proxy for .ts files
app.get('/*.ts', async (req, res) => {
  const url = `https://owrcovcrpy.gpcdn.net/bpk-tv/1701/output${req.path}`;
  try {
    const response = await fetch(url);
    res.set('Content-Type', 'video/MP2T');
    response.body.pipe(res);
  } catch (err) {
    res.status(404).end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
