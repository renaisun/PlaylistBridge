import { useEffect, useState } from "react";
import { getTokenFromUrl, searchTrack, createPlaylist, addTracksToPlaylist, getCurrentUserProfile } from "@/services/spotify";
import Login from "@/components/Login";
import PlatformSelector from "@/components/PlatformSelector";
import SongInput from "@/components/SongInput";
import Results from "@/components/Results";
import { Button } from "@/components/ui/button";
import { Loader2, Music, LogOut } from "lucide-react";

function App() {
  const [token, setToken] = useState(null);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const hash = getTokenFromUrl();
      const _token = hash.access_token;

      if (_token) {
        // Fresh login from redirect
        setToken(_token);
        localStorage.setItem("spotify_token", _token);
        window.history.pushState({}, null, "/spotify");
        setSelectedPlatform('spotify');
        
        // Fetch profile immediately
        const profile = await getCurrentUserProfile(_token);
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        // Check for stored token
        const storedToken = localStorage.getItem("spotify_token");
        if (storedToken) {
          // Validate token by fetching profile
          const profile = await getCurrentUserProfile(storedToken);
          if (profile) {
            setToken(storedToken);
            setUserProfile(profile);
            setSelectedPlatform('spotify');
          } else {
            // Token is invalid/expired
            localStorage.removeItem("spotify_token");
            if (window.location.pathname.startsWith('/spotify')) {
              setSelectedPlatform('spotify');
            }
          }
        } else if (window.location.pathname.startsWith('/spotify')) {
          setSelectedPlatform('spotify');
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("spotify_token");
    setResults([]);
    setInput("");
    setSelectedPlatform(null);
    window.history.pushState({}, null, "/");
  };

  const handleSearch = async () => {
    if (!input.trim()) return;
    setIsSearching(true);
    setResults([]);

    const lines = input.split("\n").filter((line) => line.trim() !== "");
    const newResults = [];

    for (const line of lines) {
      const track = await searchTrack(token, line.trim());
      newResults.push({ original: line, track });
    }

    setResults(newResults);
    setIsSearching(false);
  };

  const handleCreatePlaylist = async () => {
    if (!userProfile || results.length === 0) return;
    
    const validTracks = results.filter(r => r.track).map(r => r.track.uri);
    if (validTracks.length === 0) {
      alert("No valid tracks found to add to playlist.");
      return;
    }

    setIsCreating(true);
    const playlistName = `Text2Playlist - ${new Date().toLocaleDateString()}`;
    const playlist = await createPlaylist(token, userProfile.id, playlistName);

    if (playlist) {
      const success = await addTracksToPlaylist(token, playlist.id, validTracks);
      if (success) {
        alert(`Playlist "${playlistName}" created with ${validTracks.length} songs!`);
      } else {
        alert("Created playlist but failed to add tracks.");
      }
    } else {
      alert("Failed to create playlist.");
    }
    setIsCreating(false);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!token) {
    if (!selectedPlatform) {
      return <PlatformSelector onSelect={(platform) => {
        setSelectedPlatform(platform);
        if (platform === 'spotify') {
          window.history.pushState({}, null, "/spotify");
        }
      }} />;
    }
    if (selectedPlatform === 'spotify') {
      return <Login />;
    }
    // Future platforms can be handled here
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold tracking-tight">Text2Playlist</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userProfile && (
              <span className="text-sm font-medium hidden md:inline-block">
                Hi, {userProfile.display_name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SongInput value={input} onChange={setInput} />
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleSearch} 
              disabled={isSearching || !input.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Spotify"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <Results results={results} />
            {results.length > 0 && (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                size="lg"
                onClick={handleCreatePlaylist}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Playlist...
                  </>
                ) : (
                  `Create Playlist with ${results.filter(r => r.track).length} Songs`
                )}
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
