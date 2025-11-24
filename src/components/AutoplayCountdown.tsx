import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';

interface AutoplayCountdownProps {
  nextEpisodeTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  onCountdownComplete: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

const AutoplayCountdown = ({
  nextEpisodeTitle,
  seasonNumber,
  episodeNumber,
  onCountdownComplete,
  onCancel,
  countdownSeconds = 8,
}: AutoplayCountdownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onCountdownComplete();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, onCountdownComplete]);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Episode</p>
              <h3 className="font-semibold text-lg">
                S{seasonNumber} E{episodeNumber}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-foreground mb-6 line-clamp-2">{nextEpisodeTitle}</p>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{secondsLeft}</span>
              </div>
              <svg className="absolute top-0 left-0 h-20 w-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-primary"
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * (countdownSeconds - secondsLeft)) / countdownSeconds}
                  style={{
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Playing in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onCountdownComplete}
              className="flex-1"
            >
              Play Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoplayCountdown;
