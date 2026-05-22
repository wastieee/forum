import { useEffect, useState } from 'react';
import { getPosts, deletePost } from '../api';
import PostCard from '../components/PostCard';
import NewPostForm from '../components/NewPostForm';

export default function Home({ username, isAdmin, onLogout, onProfile, theme, toggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  function handleCreated(post) {
    setPosts(prev => [post, ...prev]);
  }

  async function handleDelete(id) {
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  return (
    <div className="home">
      <header className="navbar">
        <span className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Pulse</span>
        <div className="navbar-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск постов..."
          />
        </div>
        <div className="navbar-right">
          <button className="profile-btn" onClick={onProfile}>
            <span className="profile-btn-avatar">{username.slice(0, 2).toUpperCase()}</span>
            {username}
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Сменить тему">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="logout-btn" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      <div className="container">
        <NewPostForm onCreated={handleCreated} />

        <div className="posts-list">
          {filtered.length === 0 && (
            <div className="empty">
              <div className="empty-icon">💬</div>
              {search ? 'Ничего не найдено' : 'Постов пока нет. Будь первым!'}
            </div>
          )}
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={username}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
