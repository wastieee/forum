import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  function handleAuth(name) {
    setUsername(name);
    setPage('home');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    setPage('login');
  }

  if (username) {
    if (page === 'profile') {
      return (
        <Profile
          username={username}
          onLogout={handleLogout}
          onBack={() => setPage('home')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    }
    return (
      <Home
        username={username}
        onLogout={handleLogout}
        onProfile={() => setPage('profile')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (page === 'login') {
    return <Login onAuth={handleAuth} switchToRegister={() => setPage('register')} theme={theme} toggleTheme={toggleTheme} />;
  }

  return <Register onAuth={handleAuth} switchToLogin={() => setPage('login')} theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
