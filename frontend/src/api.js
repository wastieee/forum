const BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

export function getIsAdmin() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !!payload.is_admin;
  } catch {
    return false;
  }
}

function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function register(username, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function getPosts() {
  const res = await fetch(`${BASE}/posts`, { headers: authHeader() });
  return res.json();
}

export async function createPost(title, content, mediaFile, spotifyUrl) {
  const form = new FormData();
  form.append('title', title);
  form.append('content', content);
  if (mediaFile) form.append('media', mediaFile);
  if (spotifyUrl) form.append('spotify_url', spotifyUrl);

  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
  return res.json();
}

export async function editPost(id, title, content) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  return res.json();
}

export async function likePost(id) {
  const res = await fetch(`${BASE}/posts/${id}/like`, {
    method: 'POST',
    headers: authHeader(),
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE}/users/profile`, { headers: authHeader() });
  return res.json();
}

export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${BASE}/users/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
}

export async function getComments(postId) {
  const res = await fetch(`${BASE}/comments/${postId}`);
  return res.json();
}

export async function createComment(postId, content) {
  const res = await fetch(`${BASE}/comments/${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function deleteComment(id) {
  const res = await fetch(`${BASE}/comments/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  return res.json();
}
