import { createServer } from 'http';
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname } from 'path';

const PORT = 3333;
const PUBLIC = join(import.meta.dirname, 'public');

// All image slots organized by section
const SLOTS = {
  'Analysis Thumbnails (16:9 — home page cards)': [
    { file: 'thumb-backrooms.png', label: 'Backrooms' },
    { file: 'thumb-mrbeast.webp', label: 'MrBeast' },
    { file: 'thumb-blippi.webp', label: 'Blippi' },
    { file: 'thumb-msrachel.webp', label: 'Ms Rachel' },
    { file: 'thumb-kreekcraft.webp', label: 'KreekCraft' },
  ],
  'Creator Avatars (square — leaderboard)': [
    { file: 'creator-james-charles.webp', label: 'James Charles' },
    { file: 'creator-mrbeast.webp', label: 'MrBeast' },
    { file: 'creator-kane-pixels.webp', label: 'Kane Pixels' },
    { file: 'creator-gibi-asmr.webp', label: 'Gibi ASMR' },
    { file: 'creator-sony-pictures-resident-evil-.webp', label: 'Sony Pictures' },
    { file: 'creator-blippi.webp', label: 'Blippi' },
    { file: 'creator-ms-rachel.webp', label: 'Ms Rachel' },
    { file: 'creator-kreekcraft.webp', label: 'KreekCraft' },
    { file: 'creator-chris-and-jack.webp', label: 'Chris and Jack' },
    { file: 'creator-graces-room.webp', label: "Grace's Room" },
    { file: 'creator-fairy-tales.webp', label: 'Fairy Tales' },
  ],
  'Music & Nursery Rhymes — Channel Tiles (2:3 portrait)': [
    { file: 'chan-music-2.webp', label: 'Ms. Rachel' },
    { file: 'cat-music-fairytales.webp', label: 'Fairy Tales' },
    { file: 'cat-music-0.webp', label: 'Cocomelon' },
    { file: 'cat-music-1.webp', label: 'Pinkfong' },
    { file: 'cat-music-2.webp', label: 'Super Simple Songs' },
    { file: 'chan-music-0.webp', label: 'ChuChu TV' },
    { file: 'chan-music-1.webp', label: 'Little Baby Bum' },
  ],
  'Challenge & Comedy — Channel Tiles (2:3 portrait)': [
    { file: 'cat-challenge-0.webp', label: 'MrBeast' },
    { file: 'cat-challenge-chrisandjack.webp', label: 'Chris and Jack' },
    { file: 'cat-challenge-1.webp', label: 'Dude Perfect' },
    { file: 'cat-challenge-2.webp', label: 'LazarBeam' },
    { file: 'chan-challenge-0.webp', label: 'Unspeakable' },
    { file: 'chan-challenge-1.webp', label: '5-Minute Crafts' },
    { file: 'chan-challenge-2.webp', label: 'Zach King' },
  ],
  'Gaming — Channel Tiles (2:3 portrait)': [
    { file: 'cat-gaming-kreekcraft.webp', label: 'KreekCraft' },
    { file: 'cat-gaming-0.webp', label: 'DanTDM' },
    { file: 'cat-gaming-1.webp', label: 'Aphmau' },
    { file: 'cat-gaming-2.webp', label: 'LankyBox' },
    { file: 'cat-gaming-ssundee.webp', label: 'SSundee' },
    { file: 'cat-gaming-grian.webp', label: 'Grian' },
    { file: 'cat-gaming-mrbeastgaming.webp', label: 'MrBeast Gaming' },
  ],
  'Pretend Play & Toys — Channel Tiles (2:3 portrait)': [
    { file: 'cat-pretend-blippi.webp', label: 'Blippi' },
    { file: 'cat-pretend-0.webp', label: 'Kids Diana Show' },
    { file: 'cat-pretend-1.webp', label: 'Vlad and Niki' },
    { file: 'cat-pretend-2.webp', label: 'Toy-Unboxing' },
    { file: 'cat-pretend-ryansworld.webp', label: "Ryan's World" },
    { file: 'cat-pretend-toysandcolors.webp', label: 'Toys and Colors' },
  ],
  'Beauty / Makeup / ASMR — Channel Tiles (2:3 portrait)': [
    { file: 'cat-beauty-2.webp', label: 'Gibi ASMR' },
    { file: 'cat-beauty-jamescharies.webp', label: 'James Charles' },
    { file: 'cat-beauty-gracesroom.webp', label: "Grace's Room" },
    { file: 'cat-beauty-0.webp', label: 'Bailey Sarian' },
    { file: 'cat-beauty-1.webp', label: 'Bretman Rock' },
    { file: 'cat-beauty-tatiwestbrook.webp', label: 'Tati Westbrook' },
    { file: 'cat-beauty-carlibybel.webp', label: 'Carli Bybel' },
    { file: 'cat-beauty-gentlewhispering.webp', label: 'GentleWhispering' },
  ],
  'Music — Video Thumbnails (16:9)': [
    { file: 'vidthumb-music-v0.webp', label: 'Ms. Rachel — Toddler Learning' },
    { file: 'vidthumb-music-v1.webp', label: 'Fairy Tales — Mangita and Larina' },
    { file: 'vidthumb-music-v2.webp', label: 'Cocomelon — Wheels on the Bus' },
    { file: 'vidthumb-music-v3.webp', label: 'Pinkfong — Baby Shark' },
    { file: 'vidthumb-music-v4.webp', label: 'Super Simple Songs — Bath Song' },
  ],
  'Challenge — Video Thumbnails (16:9)': [
    { file: 'vidthumb-challenge-v0.webp', label: 'MrBeast — Last To Leave Grocery Store' },
    { file: 'vidthumb-challenge-v1.webp', label: 'Chris and Jack — A vital message' },
    { file: 'vidthumb-challenge-v2.webp', label: 'Dude Perfect — Trick Shots' },
    { file: 'vidthumb-challenge-v3.webp', label: 'LazarBeam — I Broke Minecraft' },
    { file: 'vidthumb-challenge-v4.webp', label: 'Zach King — Magic Tricks' },
  ],
  'Gaming — Video Thumbnails (16:9)': [
    { file: 'vidthumb-gaming-v0.webp', label: 'KreekCraft — So.. Roblox lied..' },
    { file: 'vidthumb-gaming-v1.webp', label: 'DanTDM — Minecraft Hardcore' },
    { file: 'vidthumb-gaming-v2.webp', label: 'SSundee — Among Us' },
    { file: 'vidthumb-gaming-v3.webp', label: 'Aphmau — My Roommate is a VAMPIRE' },
    { file: 'vidthumb-gaming-v4.webp', label: 'LankyBox — Roblox DOORS' },
  ],
  'Pretend Play — Video Thumbnails (16:9)': [
    { file: 'vidthumb-pretend-v0.webp', label: 'Blippi — Jurassic Puppy Show' },
    { file: 'vidthumb-pretend-v1.webp', label: 'Kids Diana Show — Pretend Play' },
    { file: 'vidthumb-pretend-v2.webp', label: "Ryan's World — Egg Surprise" },
    { file: 'vidthumb-pretend-v3.webp', label: 'Vlad and Niki — Hide and Seek' },
  ],
  'Beauty — Video Thumbnails (16:9)': [
    { file: 'vidthumb-beauty-v0.webp', label: 'Gibi ASMR — Private Jet Flight' },
    { file: 'vidthumb-beauty-v1.webp', label: 'James Charles — Coachella 2026' },
    { file: 'vidthumb-beauty-v2.webp', label: "Grace's Room — Simple Day" },
    { file: 'vidthumb-beauty-v3.webp', label: 'Bailey Sarian — Murder Mystery' },
    { file: 'vidthumb-beauty-v4.webp', label: 'Bretman Rock — Drugstore Makeup' },
    { file: 'vidthumb-beauty-v5.webp', label: 'Tati Westbrook — Glam Routine' },
  ],
};

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function buildSlotData() {
  const out = {};
  for (const [section, slots] of Object.entries(SLOTS)) {
    out[section] = [];
    for (const s of slots) {
      const exists = await fileExists(join(PUBLIC, s.file));
      out[section].push({ ...s, exists });
    }
  }
  return out;
}

function html(slotData) {
  let cards = '';
  for (const [section, slots] of Object.entries(slotData)) {
    const isVideo = section.includes('16:9') || section.includes('Video');
    const isAvatar = section.includes('Avatar') || section.includes('square');
    let aspect = '2 / 3';
    let w = '160px';
    if (isVideo) { aspect = '16 / 9'; w = '240px'; }
    if (isAvatar) { aspect = '1 / 1'; w = '120px'; }

    cards += `<div class="section"><h2>${section}</h2><div class="grid" style="--w:${w}">`;
    for (const s of slots) {
      const statusClass = s.exists ? 'has' : 'empty';
      const imgTag = s.exists
        ? `<img src="/public/${s.file}?t=${Date.now()}" />`
        : `<div class="placeholder">Drop image here</div>`;
      cards += `
        <div class="slot ${statusClass}" data-file="${s.file}" style="aspect-ratio:${aspect}">
          <div class="img-wrap">${imgTag}</div>
          <div class="label">${s.label}</div>
          <div class="filename">${s.file}</div>
          <div class="badge">${s.exists ? 'HAS IMAGE' : 'NEEDS IMAGE'}</div>
          <input type="file" accept="image/*" class="file-input" />
        </div>`;
    }
    cards += '</div></div>';
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Dashboard Image Dropper</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a1a; color: #eee; padding: 24px 32px; }
h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; color: #33A544; }
.subtitle { color: #999; font-size: 14px; margin-bottom: 32px; }
.stats { display: flex; gap: 16px; margin-bottom: 28px; }
.stat { background: #2a2a2a; border-radius: 10px; padding: 14px 20px; font-size: 14px; }
.stat b { font-size: 22px; display: block; margin-bottom: 2px; }
.stat.done b { color: #33A544; }
.stat.todo b { color: #D8690E; }
.section { margin-bottom: 36px; }
h2 { font-size: 16px; font-weight: 700; color: #ccc; margin-bottom: 14px; border-bottom: 1px solid #333; padding-bottom: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--w), 1fr)); gap: 16px; }
.slot { position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; border: 2px solid #333; }
.slot:hover { transform: scale(1.03); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
.slot.has { border-color: #33A544; }
.slot.empty { border-color: #555; border-style: dashed; }
.slot.dragover { border-color: #FFC60B !important; background: rgba(255,198,11,0.1) !important; transform: scale(1.05); }
.slot.uploading { opacity: 0.5; pointer-events: none; }
.img-wrap { position: absolute; inset: 0; }
.img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #2a2a2a; color: #666; font-size: 13px; font-weight: 600; }
.label { position: absolute; bottom: 28px; left: 8px; right: 8px; font-size: 13px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.8); z-index: 2; }
.filename { position: absolute; bottom: 8px; left: 8px; right: 8px; font-size: 10px; color: rgba(255,255,255,0.5); font-family: monospace; z-index: 2; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
.badge { position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 800; letter-spacing: 0.05em; padding: 3px 8px; border-radius: 5px; z-index: 3; }
.has .badge { background: #33A544; color: #fff; }
.empty .badge { background: #555; color: #aaa; }
.file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 10; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #33A544; color: #fff; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; z-index: 100; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.toast.show { opacity: 1; }
</style></head>
<body>
<h1>Dashboard Image Dropper</h1>
<p class="subtitle">Click any slot or drag-and-drop an image onto it. Images are saved to <code>/public/</code> instantly.</p>
<div class="stats">
  <div class="stat done"><b id="done-count">0</b>have images</div>
  <div class="stat todo"><b id="todo-count">0</b>need images</div>
</div>
${cards}
<div class="toast" id="toast"></div>
<script>
function updateCounts() {
  document.getElementById('done-count').textContent = document.querySelectorAll('.slot.has').length;
  document.getElementById('todo-count').textContent = document.querySelectorAll('.slot.empty').length;
}
updateCounts();

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

async function uploadFile(slot, file) {
  const filename = slot.dataset.file;
  slot.classList.add('uploading');
  const form = new FormData();
  form.append('image', file);
  form.append('filename', filename);
  try {
    const res = await fetch('/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error(await res.text());
    // Update UI
    const wrap = slot.querySelector('.img-wrap');
    wrap.innerHTML = '<img src="/public/' + filename + '?t=' + Date.now() + '" />';
    slot.classList.remove('empty');
    slot.classList.add('has');
    slot.querySelector('.badge').textContent = 'HAS IMAGE';
    toast('Saved: ' + filename);
    updateCounts();
  } catch (e) {
    toast('Error: ' + e.message);
  }
  slot.classList.remove('uploading');
}

document.querySelectorAll('.slot').forEach(slot => {
  // Drag and drop
  slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('dragover'); });
  slot.addEventListener('dragleave', () => slot.classList.remove('dragover'));
  slot.addEventListener('drop', e => {
    e.preventDefault();
    slot.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) uploadFile(slot, file);
  });
  // File input click
  slot.querySelector('.file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) uploadFile(slot, file);
    e.target.value = '';
  });
});
</script>
</body></html>`;
}

const server = createServer(async (req, res) => {
  // Serve images from /public/
  if (req.method === 'GET' && req.url.startsWith('/public/')) {
    const filePath = join(PUBLIC, decodeURIComponent(req.url.replace('/public/', '').split('?')[0]));
    try {
      const data = await readFile(filePath);
      const ext = extname(filePath).toLowerCase();
      const types = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  // Upload endpoint
  if (req.method === 'POST' && req.url === '/upload') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        const parts = parseMultipart(body, boundary);
        const filename = parts.filename;
        const imageData = parts.image;
        if (!filename || !imageData) {
          res.writeHead(400);
          res.end('Missing filename or image');
          return;
        }
        // Save as-is (keep original format, the browser/code handles it)
        await writeFile(join(PUBLIC, filename), imageData);
        res.writeHead(200);
        res.end('OK');
        console.log(`  Saved: ${filename} (${(imageData.length / 1024).toFixed(1)} KB)`);
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
    });
    return;
  }

  // Main page
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const slotData = await buildSlotData();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html(slotData));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Simple multipart parser
function parseMultipart(body, boundary) {
  const result = {};
  const sep = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;
  while (true) {
    const idx = body.indexOf(sep, start);
    if (idx === -1) break;
    if (start > 0) parts.push(body.subarray(start, idx - 2)); // -2 for \r\n
    start = idx + sep.length + 2; // skip \r\n after boundary
  }
  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const header = part.subarray(0, headerEnd).toString();
    const content = part.subarray(headerEnd + 4);
    const nameMatch = header.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    if (name === 'image') {
      result.image = content;
    } else {
      result[name] = content.toString().trim();
    }
  }
  return result;
}

server.listen(PORT, () => {
  console.log(`\n  Image Dropper running at http://localhost:${PORT}\n`);
  console.log(`  Drop images into slots — they save to /public/ instantly.\n`);
});
