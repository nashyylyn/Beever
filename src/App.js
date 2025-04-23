import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);

  const clientId = "a5866140a4394b45ab32bb07f0036d70"; 
  const redirectUri = "https://quantity-north-component-hull.trycloudflare.com"; 

  useEffect(() => {
    
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');
    
    if (authCode) {
      
      exchangeAuthorizationCodeForToken(authCode);
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    
    const storedToken = localStorage.getItem('spotify_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginWithSpotify = () => {
    const scopes = [
      "playlist-read-private",
      "user-read-playback-state",
    ];
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}` +
                    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                    `&response_type=code` +
                    `&scope=${encodeURIComponent(scopes.join(' '))}`;

    console.log("Redirecting to Spotify...");
    window.location.href = authUrl; 
  };

  const exchangeAuthorizationCodeForToken = async (authCode) => {
    const tokenUrl = "https://accounts.spotify.com/api/token";

    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', authCode);
    formData.append('redirect_uri', redirectUri);
    formData.append('client_id', clientId);

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('spotify_token', data.access_token); 
    } else {
      console.error('Error fetching token', data);
    }
  };

  const search = async () => {
    if (!query || !token) return;
    
    console.log("Fetching tracks...");
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!res.ok) {
      console.error('Error fetching data from Spotify:', res);
      return;
    }

    const data = await res.json();
    console.log('Received tracks:', data); 
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
        {tracks.length > 0 ? (
          tracks.map((track) => (
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
          ))
        ) : (
          <p>No tracks found. Try a different search!</p>
        )}
      </div>
    </div>
  );
}

export default App;
