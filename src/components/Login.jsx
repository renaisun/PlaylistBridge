import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectToAuthCodeFlow } from "@/services/spotify";
import { useState } from "react";

const Login = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const [customRedirectUri, setCustomRedirectUri] = useState("https://playlist-bridge-demo.vercel.app/spotify/callback");

  const handleLogin = () => {
    let finalClientId = clientId;
    let finalRedirectUri = null;

    if (useCustomCredentials) {
      if (customClientId.trim()) {
        finalClientId = customClientId.trim();
      }
      if (customRedirectUri.trim()) {
        finalRedirectUri = customRedirectUri.trim();
      }
    }

    if (finalClientId) {
      redirectToAuthCodeFlow(finalClientId, finalRedirectUri);
    } else {
      alert("Please set VITE_SPOTIFY_CLIENT_ID in your .env file or provide a custom Client ID");
    }
  };

  const isLoginDisabled = !clientId && !(useCustomCredentials && customClientId);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">PlaylistBridge</CardTitle>
          <CardDescription className="text-center">
            Connect your Spotify account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!clientId && !useCustomCredentials && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              Configuration Error: <code>VITE_SPOTIFY_CLIENT_ID</code> is missing in <code>.env</code> file.
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="custom-credentials"
              checked={useCustomCredentials}
              onChange={(e) => setUseCustomCredentials(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="custom-credentials">Use custom credentials</Label>
          </div>

          {useCustomCredentials && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input
                  id="client-id"
                  placeholder="Enter your Spotify Client ID"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect-uri">Redirect URI</Label>
                <Input
                  id="redirect-uri"
                  placeholder="Enter your Spotify Redirect URI"
                  value={customRedirectUri}
                  onChange={(e) => setCustomRedirectUri(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleLogin} disabled={isLoginDisabled}>
            Connect to Spotify
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
