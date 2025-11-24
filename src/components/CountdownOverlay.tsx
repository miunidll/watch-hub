import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CountdownOverlayProps {
  seconds: number;
  nextEpisodeTitle: string;
  onComplete: () => void;
  onCancel: () => void;
}

const CountdownOverlay = ({ seconds, nextEpisodeTitle, onComplete, onCancel }: CountdownOverlayProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center space-y-6 px-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">Next Episode</p>
          <h3 className="text-2xl font-bold">{nextEpisodeTitle}</h3>
        </div>
        
        <div className="relative">
          <div className="text-6xl font-bold tabular-nums">{timeLeft}</div>
          <p className="text-sm text-muted-foreground mt-2">seconds</p>
        </div>

        <Button 
          variant="outline" 
          size="lg"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CountdownOverlay;
