import { useState } from 'react';
import { getComments, createComment } from '../api';

export default function PostCard({ post, currentUser, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');

  const date = new Date(post.created_at).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const initials = post.username.slice(0, 2).toUpperCase();

  async function toggleComments() {
    if (!loaded) {
      const data = await getComments(post.id);
      setComments(data);
      setLoaded(true);
    }
    setShowComments(v => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = await createComment(post.id, text.trim());
    setComments(prev => [...prev, comment]);
    setText('');
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{initials}</div>
        <div className="post-meta">
          <span className="post-author">{post.username}</span>
          <span className="post-date">{date}</span>
        </div>
      </div>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button className="comments-toggle" onClick={toggleComments}>
          💬 {showComments ? 'Скрыть' : 'Комментарии'}{loaded ? ` (${comments.length})` : ''}
        </button>
        {currentUser === post.username && (
          <button className="delete-btn" onClick={() => onDelete(post.id)}>
            Удалить
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length === 0 && (
            <p className="comments-empty">Комментариев пока нет</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="comment">
              <span className="comment-author">{c.username}</span>
              <span className="comment-content">{c.content}</span>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Написать комментарий..."
            />
            <button type="submit">Отправить</button>
          </form>
        </div>
      )}
    </div>
  );
}
