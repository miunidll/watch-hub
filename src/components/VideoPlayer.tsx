import { useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

const VideoPlayer = ({ url, title, initialTime = 0, onTimeUpdate }: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current?.plyr && initialTime > 0) {
      playerRef.current.plyr.currentTime = initialTime;
    }
  }, [initialTime, url]);

  useEffect(() => {
    const player = playerRef.current?.plyr;
    if (!player || !onTimeUpdate) return;

    const handleTimeUpdate = () => {
      if (player.currentTime) {
        onTimeUpdate(player.currentTime);
      }
    };

    // Use addEventListener on the media element instead of plyr's .on method
    const mediaElement = player.media;
    if (mediaElement) {
      mediaElement.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [onTimeUpdate]);

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <Plyr
        ref={playerRef}
        source={{
          type: 'video',
          title: title,
          sources: [
            {
              src: url,
              type: 'video/mp4',
            },
          ],
        }}
        options={{
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
        }}
      />
    </div>
  );
};

export default VideoPlayer;
