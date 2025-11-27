const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + "/spotify/callback";
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export const redirectToAuthCodeFlow = async (clientId, redirectUri = null) => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('code_verifier', codeVerifier);
  window.localStorage.setItem('spotify_client_id', clientId);
  if (redirectUri) {
    window.localStorage.setItem('spotify_redirect_uri', redirectUri);
  } else {
    window.localStorage.removeItem('spotify_redirect_uri');
  }

  const effectiveRedirectUri = redirectUri || REDIRECT_URI;

  const params =  new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES.join(" "),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: effectiveRedirectUri,
  });

  document.location = `${AUTH_ENDPOINT}?${params.toString()}`;
}

export const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

export const getAccessToken = async (code) => {
  const storedClientId = window.localStorage.getItem('spotify_client_id');
  const storedRedirectUri = window.localStorage.getItem('spotify_redirect_uri');
  
  const clientId = storedClientId || import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = storedRedirectUri || REDIRECT_URI;
  const codeVerifier = localStorage.getItem('code_verifier');

  if (!codeVerifier) {
      console.error("Code verifier not found");
      return null;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    if (data.error) {
        console.error("Error exchanging token:", data.error);
        return null;
    }
    return data;
  } catch (error) {
    console.error("Error exchanging token:", error);
    return null;
  }
};

export const searchTrack = async (token, query) => {
  if (!query) return null;
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.tracks.items[0] || null;
  } catch (error) {
    console.error("Error searching track:", error);
    return null;
  }
};

export const getCurrentUserProfile = async (token) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const createPlaylist = async (token, userId, name) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: "Created with PlaylistBridge",
          public: false,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

export const addTracksToPlaylist = async (token, playlistId, uris) => {
  try {
    const chunkSize = 100;
    for (let i = 0; i < uris.length; i += chunkSize) {
      const chunk = uris.slice(i, i + chunkSize);
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: chunk,
        }),
      });
    }
    return true;
  } catch (error) {
    console.error("Error adding tracks:", error);
    return false;
  }
};
