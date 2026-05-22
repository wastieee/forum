import { useState, useRef } from 'react';
import { createPost } from '../api';

function parseSpotifyEmbed(url) {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
}

export default function NewPostForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [showSpotify, setShowSpotify] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setPreview({ url: URL.createObjectURL(file), type: file.type });
  }

  function removeMedia() {
    setMediaFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const spotifyEmbed = spotifyUrl ? parseSpotifyEmbed(spotifyUrl) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (spotifyUrl && !spotifyEmbed) {
      setError('Неверная ссылка Spotify');
      return;
    }
    const res = await createPost(title, content, mediaFile, spotifyUrl || null);
    if (res.error) {
      setError(res.error);
    } else {
      onCreated(res);
      setTitle('');
      setContent('');
      setSpotifyUrl('');
      setShowSpotify(false);
      removeMedia();
    }
  }

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <div className="new-post-header">
        <span className="new-post-label">Новый пост</span>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Напиши что-нибудь..." rows={3} />

      {preview && (
        <div className="media-preview">
          {preview.type.startsWith('video') ? (
            <video src={preview.url} controls />
          ) : preview.type.startsWith('audio') ? (
            <audio src={preview.url} controls />
          ) : (
            <img src={preview.url} alt="preview" />
          )}
          <button type="button" className="remove-media-btn" onClick={removeMedia}>✕</button>
        </div>
      )}

      {showSpotify && (
        <div className="spotify-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <input
            value={spotifyUrl}
            onChange={e => setSpotifyUrl(e.target.value)}
            placeholder="Вставь ссылку на трек Spotify..."
          />
          {spotifyUrl && (
            <button type="button" className="remove-media-btn" style={{position:'static',width:22,height:22,fontSize:11}} onClick={() => setSpotifyUrl('')}>✕</button>
          )}
        </div>
      )}

      {spotifyEmbed && (
        <div className="spotify-preview">
          <iframe src={spotifyEmbed} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="form-footer">
        <div className="form-media-btns">
          <button type="button" className="media-btn" onClick={() => fileRef.current.click()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <button type="button" className={`media-btn${showSpotify ? ' media-btn--active' : ''}`} onClick={() => setShowSpotify(v => !v)} title="Добавить трек Spotify">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <button type="submit">Опубликовать</button>
      </div>
    </form>
  );
}
