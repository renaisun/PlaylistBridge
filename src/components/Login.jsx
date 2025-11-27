import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectToAuthCodeFlow } from "@/services/spotify";

const Login = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

  const handleLogin = () => {
    if (clientId) {
      redirectToAuthCodeFlow(clientId);
    } else {
      alert("Please set VITE_SPOTIFY_CLIENT_ID in your .env file");
    }
  };

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
          {!clientId && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              Configuration Error: <code>VITE_SPOTIFY_CLIENT_ID</code> is missing in <code>.env</code> file.
            </div>
          )}
          <Button className="w-full" onClick={handleLogin} disabled={!clientId}>
            Connect to Spotify
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
