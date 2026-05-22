import { useState } from 'react';
import { getComments, createComment, deleteComment, likePost, deletePost, editPost } from '../api';

const MEDIA_BASE = 'http://localhost:3001';

function parseSpotifyEmbed(url) {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
}

export default function PostCard({ post: initialPost, currentUser, isAdmin, onDelete }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  const date = new Date(post.created_at).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const initials = post.username.slice(0, 2).toUpperCase();
  const isOwn = currentUser === post.username;
  const canDelete = isOwn || isAdmin;

  async function toggleComments() {
    if (!loaded) {
      const data = await getComments(post.id);
      setComments(data);
      setLoaded(true);
    }
    setShowComments(v => !v);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = await createComment(post.id, text.trim());
    setComments(prev => [...prev, comment]);
    setText('');
  }

  async function handleDeleteComment(id) {
    await deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  async function handleLike() {
    const res = await likePost(post.id);
    setPost(p => ({ ...p, like_count: res.like_count, user_liked: res.user_liked }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    const updated = await editPost(post.id, editTitle, editContent);
    if (!updated.error) {
      setPost(p => ({ ...p, title: updated.title, content: updated.content }));
      setEditing(false);
    }
  }

  const isVideo = post.media_url && /\.(mp4|webm|mov)$/i.test(post.media_url);
  const isAudio = post.media_url && /\.(mp3|wav|ogg|flac)$/i.test(post.media_url);
  const spotifyEmbed = post.spotify_url ? parseSpotifyEmbed(post.spotify_url) : null;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{initials}</div>
        <div className="post-meta">
          <span className="post-author">{post.username}</span>
          <span className="post-date">{date}</span>
        </div>
        {canDelete && !editing && (
          <div className="post-owner-actions">
            {isOwn && (
              <button className="icon-btn" onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditing(true); }} title="Редактировать">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <button className="icon-btn icon-btn--danger" onClick={() => onDelete(post.id)} title="Удалить">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form className="edit-form" onSubmit={handleSaveEdit}>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} />
          <div className="edit-actions">
            <button type="submit" className="save-btn">Сохранить</button>
            <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Отмена</button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="post-title">{post.title}</h3>
          <p className="post-content">{post.content}</p>
        </>
      )}

      {post.media_url && (
        <div className={isAudio ? 'post-audio' : 'post-media'}>
          {isVideo ? (
            <video src={`${MEDIA_BASE}${post.media_url}`} controls />
          ) : isAudio ? (
            <audio src={`${MEDIA_BASE}${post.media_url}`} controls />
          ) : (
            <img src={`${MEDIA_BASE}${post.media_url}`} alt="" />
          )}
        </div>
      )}

      {spotifyEmbed && (
        <div className="post-spotify">
          <iframe src={spotifyEmbed} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
        </div>
      )}

      <div className="post-actions">
        <button className={`like-btn${post.user_liked ? ' liked' : ''}`} onClick={handleLike}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.user_liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.like_count > 0 && <span>{post.like_count}</span>}
        </button>

        <button className="comments-toggle" onClick={toggleComments}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {loaded ? comments.length : ''}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length === 0 && <p className="comments-empty">Комментариев пока нет</p>}
          {comments.map(c => (
            <div key={c.id} className="comment">
              <span className="comment-author">{c.username}</span>
              <span className="comment-content">{c.content}</span>
              {(c.username === currentUser || isAdmin) && (
                <button className="comment-delete" onClick={() => handleDeleteComment(c.id)} title="Удалить">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
          <form className="comment-form" onSubmit={handleComment}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Написать комментарий..." />
            <button type="submit">→</button>
          </form>
        </div>
      )}
    </div>
  );
}
