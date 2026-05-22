const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { SECRET } = require('./auth');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Невалидный токен' });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime)|audio\/(mpeg|wav|ogg|flac|x-wav))$/;
    cb(null, allowed.test(file.mimetype));
  },
});

router.get('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  if (token) {
    try { userId = jwt.verify(token, SECRET).id; } catch {}
  }

  const posts = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
    FROM posts p ORDER BY p.created_at DESC
  `).all();

  if (userId) {
    const likedSet = new Set(
      db.prepare('SELECT post_id FROM likes WHERE user_id = ?').all(userId).map(r => r.post_id)
    );
    posts.forEach(p => { p.user_liked = likedSet.has(p.id) ? 1 : 0; });
  } else {
    posts.forEach(p => { p.user_liked = 0; });
  }

  res.json(posts);
});

router.post('/', authMiddleware, upload.single('media'), (req, res) => {
  const { title, content, spotify_url } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Заполни все поля' });

  const media_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db.prepare(
    'INSERT INTO posts (title, content, user_id, username, media_url, spotify_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, content, req.user.id, req.user.username, media_url, spotify_url || null);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  post.like_count = 0;
  post.user_liked = 0;
  res.json(post);
});

router.put('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });
  if (post.user_id !== req.user.id && !req.user.is_admin) return res.status(403).json({ error: 'Это не твой пост' });

  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Заполни все поля' });

  db.prepare('UPDATE posts SET title = ?, content = ? WHERE id = ?').run(title, content, req.params.id);
  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  updated.like_count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;
  updated.user_liked = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, req.params.id) ? 1 : 0;
  res.json(updated);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });
  if (post.user_id !== req.user.id && !req.user.is_admin) return res.status(403).json({ error: 'Это не твой пост' });

  db.prepare('DELETE FROM likes WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM comments WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/like', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.user.id, req.params.id);
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, req.params.id);
  }
  const like_count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;
  res.json({ like_count, user_liked: !existing ? 1 : 0 });
});

module.exports = router;
