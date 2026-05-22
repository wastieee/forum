import { useState } from 'react';
import { login } from '../api';

export default function Login({ onAuth, switchToRegister, theme, toggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
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
        <div className="auth-logo">Pulse</div>
        <h2>Войти</h2>
        <p className="auth-subtitle">Добро пожаловать обратно</p>
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
          <button type="submit">Войти</button>
        </form>
        <div className="auth-footer">
          Нет аккаунта?{' '}
          <span className="link" onClick={switchToRegister}>Зарегистрироваться</span>
        </div>
      </div>
    </div>
  );
}
