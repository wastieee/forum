import { useState } from 'react';
import { createPost } from '../api';

export default function NewPostForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await createPost(title, content);
    if (res.error) {
      setError(res.error);
    } else {
      onCreated(res);
      setTitle('');
      setContent('');
    }
  }

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <h3>Новый пост</h3>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Заголовок"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Напиши что-нибудь..."
        rows={3}
      />
      {error && <div className="error">{error}</div>}
      <div className="form-footer">
        <button type="submit">Опубликовать</button>
      </div>
    </form>
  );
}
