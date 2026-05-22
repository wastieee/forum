const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

router.get('/:postId', (req, res) => {
  const comments = db
    .prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC')
    .all(req.params.postId);
  res.json(comments);
});

router.post('/:postId', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Комментарий пустой' });

  const result = db
    .prepare('INSERT INTO comments (post_id, user_id, username, content) VALUES (?, ?, ?, ?)')
    .run(req.params.postId, req.user.id, req.user.username, content);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.json(comment);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });
  if (comment.user_id !== req.user.id && !req.user.is_admin) return res.status(403).json({ error: 'Это не твой комментарий' });

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
