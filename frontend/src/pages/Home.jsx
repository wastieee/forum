import { useEffect, useState } from 'react';
import { getPosts, deletePost } from '../api';
import PostCard from '../components/PostCard';
import NewPostForm from '../components/NewPostForm';

export default function Home({ username, onLogout, onProfile, theme, toggleTheme }) {
  const [posts, setPosts] = useState([]);

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

  return (
    <div className="home">
      <header className="navbar">
        <span className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>⬡ Форум</span>
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
          {posts.length === 0 && (
            <div className="empty">
              <div className="empty-icon">💬</div>
              Постов пока нет. Будь первым!
            </div>
          )}
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={username}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
