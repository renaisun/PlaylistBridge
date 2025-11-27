import { useEffect, useState, useRef } from "react";
import { getTokenFromUrl, searchTrack, createPlaylist, addTracksToPlaylist, getCurrentUserProfile, getAccessToken } from "@/services/spotify";
import Login from "@/components/Login";
import PlatformSelector from "@/components/PlatformSelector";
import SongInput from "@/components/SongInput";
import Results from "@/components/Results";
import { Button } from "@/components/ui/button";
import { Loader2, Music, LogOut, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function App() {
  const [token, setToken] = useState(null);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [activeSection, setActiveSection] = useState('input'); // 'input' | 'results'
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const authCalled = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (authCalled.current) return;
      authCalled.current = true;

      const hash = getTokenFromUrl();
      const _token = hash.access_token;
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      console.log("code", code);

      if (_token) {
        // Fresh login from redirect (Implicit Flow - Legacy support)
        setToken(_token);
        localStorage.setItem("spotify_token", _token);
        window.history.pushState({}, null, "/spotify");
        setSelectedPlatform('spotify');
        
        const profile = await getCurrentUserProfile(_token);
        if (profile) {
          setUserProfile(profile);
        }
      } else if (code) {
        // Fresh login from redirect (PKCE Flow)
        const data = await getAccessToken(code);
        if (data && data.access_token) {
          setToken(data.access_token);
          localStorage.setItem("spotify_token", data.access_token);
          window.history.pushState({}, null, "/spotify");
          setSelectedPlatform('spotify');

          const profile = await getCurrentUserProfile(data.access_token);
          if (profile) {
            setUserProfile(profile);
          }
        } else {
           // Failed to exchange token
           toast.error("Failed to authenticate with Spotify");
        }
      } else if (window.location.pathname.startsWith('/spotify')) {
        // Only check for stored token if we are on the spotify route
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
            setSelectedPlatform('spotify');
          }
        } else {
          setSelectedPlatform('spotify');
        }
      }
      // If at root /, do nothing (let PlatformSelector show)
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
    setProgress(0);
    setActiveSection('results');

    const lines = input.split("\n").filter((line) => line.trim() !== "");
    let processedCount = 0;

    for (const line of lines) {
      const track = await searchTrack(token, line.trim());
      setResults(prev => [...prev, { original: line, track }]);
      processedCount++;
      setProgress(Math.round((processedCount / lines.length) * 100));
    }

    setIsSearching(false);
  };

  const handleExport = async () => {
    if (results.length === 0) return;

    setIsExporting(true);
    // Add a small delay to show the spinner
    await new Promise(resolve => setTimeout(resolve, 500));

    const exportData = results.map(result => ({
      query: result.original,
      name: result.track ? result.track.name : null,
      artists: result.track ? result.track.artists.map(a => a.name) : null
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spotify_search_results.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const handleCreatePlaylist = () => {
    if (!userProfile || results.length === 0) return;
    
    const validTracks = results.filter(r => r.track).map(r => r.track.uri);
    if (validTracks.length === 0) {
      toast.error("No valid tracks found to add to playlist.");
      return;
    }

    setPlaylistName(`PlaylistBridge - ${new Date().toLocaleDateString()}`);
    setIsDialogOpen(true);
  };

  const confirmCreatePlaylist = async () => {
    if (!playlistName.trim()) return;

    setIsCreating(true);
    const validTracks = results.filter(r => r.track).map(r => r.track.uri);
    const playlist = await createPlaylist(token, userProfile.id, playlistName);

    if (playlist) {
      const success = await addTracksToPlaylist(token, playlist.id, validTracks);
      if (success) {
        toast.success(`Playlist "${playlistName}" created with ${validTracks.length} songs!`);
        setIsDialogOpen(false);
      } else {
        toast.error("Created playlist but failed to add tracks.");
      }
    } else {
      toast.error("Failed to create playlist.");
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
      return <PlatformSelector onSelect={async (platform) => {
        if (platform === 'spotify') {
          window.history.pushState({}, null, "/spotify");
          setSelectedPlatform('spotify');
          
          // Check for stored token when user explicitly selects Spotify
          const storedToken = localStorage.getItem("spotify_token");
          if (storedToken) {
            const profile = await getCurrentUserProfile(storedToken);
            if (profile) {
              setToken(storedToken);
              setUserProfile(profile);
            } else {
              localStorage.removeItem("spotify_token");
            }
          }
        } else {
          setSelectedPlatform(platform);
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
      <div className="max-w-[95%] mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold tracking-tight">PlaylistBridge</h1>
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

        <main className="flex flex-col md:flex-row gap-6 transition-all duration-300 ease-in-out h-[calc(100vh-200px)]">
          {/* Input Section */}
          <div 
            className={`
              transition-all duration-500 ease-in-out
              ${activeSection === 'results' ? 'w-full md:w-16 cursor-pointer hover:bg-accent/50 rounded-lg' : 'w-full md:flex-1'}
              flex flex-col
            `}
            onClick={() => activeSection === 'results' && setActiveSection('input')}
          >
            {activeSection === 'results' ? (
              <div className="h-full flex flex-col items-center py-8 space-y-4 text-muted-foreground">
                <div className="writing-mode-vertical rotate-180 text-lg font-semibold tracking-widest whitespace-nowrap">
                  INPUT SONGS
                </div>
                <Music className="h-6 w-6" />
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center md:hidden">
                   {/* Mobile only header if needed, or keep clean */}
                </div>
                <div className="flex-1">
                  <SongInput value={input} onChange={setInput} />
                </div>
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
            )}
          </div>

          {/* Results Section */}
          <div 
            className={`
              transition-all duration-500 ease-in-out
              ${activeSection === 'input' ? 'w-full md:w-16 cursor-pointer hover:bg-accent/50 rounded-lg' : 'w-full md:flex-1'}
              flex flex-col
            `}
            onClick={() => activeSection === 'input' && setActiveSection('results')}
          >
            {activeSection === 'input' ? (
              <div className="h-full flex flex-col items-center py-8 space-y-4 text-muted-foreground">
                <div className="writing-mode-vertical rotate-180 text-lg font-semibold tracking-widest whitespace-nowrap">
                  RESULTS
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-mono">{results.length}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                   <Results results={results} progress={progress} isSearching={isSearching} />
                </div>
                {results.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
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
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export JSON
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new Spotify playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmCreatePlaylist} disabled={isCreating || !playlistName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}

export default App;
