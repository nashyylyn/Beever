import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);


  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        window.location.hash = '';
      }
    }
  }, []);
  
  const loginWithSpotify = () => {
    const clientId = "a5866140a4394b45ab32bb07f0036d70"; 
const redirectUri = "https://quad-updated-authority-subjective.trycloudflare.com"; 
const scopes = [
  "playlist-read-private",
  "user-read-playback-state"
];
const authUrl = `https://accounts.spotify.com/authorize?` +
`client_id=${clientId}` +
`&redirect_uri=${encodeURIComponent(redirectUri)}` +
`&response_type=token` +
`&scope=${encodeURIComponent(scopes.join(' '))}`;


  console.log("Redirecting to Spotify...");
  window.location.href = authUrl;


  };
  
  const search = async () => {
    if (!query) return;
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    setTracks(data.tracks.items);
  };

  if (!token) {
    return (
      <div className="center-screen">
        <button onClick={loginWithSpotify} className="btn">
          Log in with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🎵 Beever</h1>
      <div className="search-bar">
        <input
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <button onClick={search}>Search</button>
      </div>

      <div className="track-list">
        {tracks.map((track) => (
          <div key={track.id} className="track-card">
            <img src={track.album.images[1]?.url} alt={track.name} />
            <div>
              <strong>{track.name}</strong>
              <p>{track.artists.map((a) => a.name).join(', ')}</p>
              {track.preview_url ? (
                <audio controls src={track.preview_url}></audio>
              ) : (
                <p>No preview available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

