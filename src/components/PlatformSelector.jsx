import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

const PlatformSelector = ({ onSelect }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Choose Platform</CardTitle>
          <CardDescription className="text-center">
            Select your preferred music service to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full h-16 text-lg justify-start px-6 bg-[#1DB954] hover:bg-[#1ed760] text-white" 
            onClick={() => onSelect('spotify')}
          >
            <Music className="mr-4 h-6 w-6" />
            Spotify
          </Button>
          
          <Button 
            className="w-full h-16 text-lg justify-start px-6" 
            variant="outline"
            disabled
          >
            <svg className="mr-4 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.556 14.633c-.088.152-.266.215-.426.125-1.215-.719-2.746-.88-4.547-.48-.172.039-.34-.07-.379-.242-.039-.172.07-.34.242-.379 1.996-.445 3.691-.25 5.035.535.16.09.223.285.125.441h-.05zm.61-2.73c-.113.191-.356.254-.543.14-1.524-.937-3.848-1.207-5.649-.66-.21.063-.433-.062-.496-.273-.062-.211.063-.434.274-.496 2.02-.614 4.59-.309 6.304.746.192.113.254.355.14.543h-.03zm.058-2.773c-1.824-1.082-4.836-1.18-6.578-.652-.277.082-.574-.074-.656-.351-.082-.278.074-.575.351-.657 2.016-.613 5.332-.496 7.414.739.254.152.336.48.184.734-.152.254-.48.336-.734.184h.02z"/>
            </svg>
            Apple Music (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSelector;
