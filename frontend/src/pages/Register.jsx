import { useState } from 'react';
import { register } from '../api';

export default function Register({ onAuth, switchToLogin, theme, toggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await register(username, password);
    if (res.error) {
      setError(res.error);
    } else {
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      onAuth(res.username);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <button className="theme-toggle auth-theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="auth-logo">⬡ Форум</div>
        <h2>Регистрация</h2>
        <p className="auth-subtitle">Создай аккаунт и присоединяйся</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Имя пользователя</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
          </div>
          <div className="input-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit">Зарегистрироваться</button>
        </form>
        <div className="auth-footer">
          Уже есть аккаунт?{' '}
          <span className="link" onClick={switchToLogin}>Войти</span>
        </div>
      </div>
    </div>
  );
}
