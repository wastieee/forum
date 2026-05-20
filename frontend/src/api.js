const BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
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
  const res = await fetch(`${BASE}/posts`);
  return res.json();
}

export async function createPost(title, content) {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE}/users/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${BASE}/users/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
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
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ content }),
  });
  return res.json();
}
