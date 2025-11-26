const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + "/spotify/callback";
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

export const loginUrl = (clientId) => {
  return `${AUTH_ENDPOINT}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES.join(" "))}&response_type=token&show_dialog=true`;
};

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
          description: "Created with Text to Spotify",
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
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: uris,
      }),
    });
    return true;
  } catch (error) {
    console.error("Error adding tracks:", error);
    return false;
  }
};
