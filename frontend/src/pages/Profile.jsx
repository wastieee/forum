import { useEffect, useState } from 'react';
import { getProfile, changePassword, deletePost } from '../api';

export default function Profile({ username, onLogout, onBack, theme, toggleTheme }) {
  const [data, setData] = useState(null);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    getProfile().then(setData);
  }, []);

  async function handleDelete(id) {
    await deletePost(id);
    setData(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id), postCount: prev.postCount - 1 }));
  }

  async function handlePassword(e) {
    e.preventDefault();
    const res = await changePassword(oldPw, newPw);
    if (res.error) {
      setPwMsg({ ok: false, text: res.error });
    } else {
      setPwMsg({ ok: true, text: 'Пароль изменён' });
      setOldPw('');
      setNewPw('');
    }
  }

  const initials = username.slice(0, 2).toUpperCase();
  const joined = data ? new Date(data.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '...';

  return (
    <div className="home">
      <header className="navbar">
        <span className="navbar-logo" onClick={onBack}>⬡ Форум</span>
        <div className="navbar-right">
          <button className="logout-btn" onClick={onBack}>← Назад</button>
          <button className="theme-toggle" onClick={toggleTheme} title="Сменить тему">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="logout-btn" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <div className="profile-name">{username}</div>
            <div className="profile-joined">На форуме с {joined}</div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{data?.postCount ?? '—'}</div>
            <div className="stat-label">постов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data?.commentCount ?? '—'}</div>
            <div className="stat-label">комментариев</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Сменить пароль</div>
          <form className="pw-form" onSubmit={handlePassword}>
            <input type="password" placeholder="Текущий пароль" value={oldPw} onChange={e => setOldPw(e.target.value)} />
            <input type="password" placeholder="Новый пароль" value={newPw} onChange={e => setNewPw(e.target.value)} />
            {pwMsg && <div className={pwMsg.ok ? 'pw-success' : 'error'}>{pwMsg.text}</div>}
            <button type="submit">Сохранить</button>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Мои посты</div>
          {data?.posts.length === 0 && <p className="comments-empty">Постов пока нет</p>}
          <div className="posts-list">
            {data?.posts.map(post => {
              const date = new Date(post.created_at).toLocaleString('ru-RU', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              });
              return (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-meta">
                      <span className="post-title">{post.title}</span>
                      <span className="post-date">{date}</span>
                    </div>
                  </div>
                  <p className="post-content">{post.content}</p>
                  <div className="post-actions">
                    <button className="delete-btn" onClick={() => handleDelete(post.id)}>Удалить</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
