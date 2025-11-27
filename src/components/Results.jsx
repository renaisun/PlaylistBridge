import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, ExternalLink } from "lucide-react";

const Results = ({ results, progress, isSearching }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Results</span>
          <Badge variant="secondary">{results.length} items</Badge>
        </CardTitle>
        {(isSearching || progress > 0) && (
          <div className="mt-2 space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full px-4">
          <div className="space-y-4 pb-4">
            {results.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mt-1">
                  {item.track ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.original}
                  </p>
                  {item.track ? (
                    <div className="text-xs text-muted-foreground">
                      <p>Found: <span className="font-semibold text-foreground">{item.track.name}</span> by {item.track.artists.map(a => a.name).join(", ")}</p>
                      <a 
                        href={item.track.external_urls.spotify} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center mt-1 hover:underline text-primary"
                      >
                        Open in Spotify <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500">No match found</p>
                  )}
                </div>
                {item.track && item.track.album.images.length > 0 && (
                  <img 
                    src={item.track.album.images[2].url} 
                    alt="Album Art" 
                    className="h-10 w-10 rounded-md object-cover"
                  />
                )}
              </div>
            ))}
            {results.length === 0 && !isSearching && (
              <div className="text-center text-muted-foreground py-8">
                No results yet. Enter songs and click search.
              </div>
            )}
            {isSearching && results.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Searching...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Results;
