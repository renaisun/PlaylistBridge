import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SongInput = ({ value, onChange }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Input Songs</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Paste your list here...&#10;Song Name - Artist&#10;Another Song - Artist"
          className="min-h-[300px] font-mono text-sm resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default SongInput;
